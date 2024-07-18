import { EduAiService } from "@/edu-ai/edu-ai.service";
import { AIDTO } from "@/edu-ai/types/ai.types";
import { LessonBlockService } from "@/lesson-block/lesson-block.service";
import { LessonTasksService } from "@/lesson-tasks/lesson-tasks.service";
import { PrismaService } from "@/prisma.service";
import { Injectable } from "@nestjs/common";
import { PubSub } from "graphql-subscriptions";
import { LessonInput, LessonWithAIInput, LessonWithAITasksBlocksInput } from "./dto/lesson.input";
import { UpdateLesson } from "./dto/update-lesson.input";
import { LessonRepository } from "./lesson.repository";
import { LessonUtils } from "./lesson.utils";

@Injectable()
export class LessonService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly lessonRepository: LessonRepository,
    private readonly lessonUtils: LessonUtils,
    private readonly eduAiService: EduAiService,
    private readonly lessonBlockService: LessonBlockService,
    private readonly lessonTasksService: LessonTasksService,
  ) {}

  async createLesson(data: LessonInput): Promise<any> {
    await this.lessonRepository.validateLesson(data);

    return await this.lessonRepository.createLesson(data);
  }

  async deleteLesson(id: string): Promise<any> {
    return await this.prisma
      .$transaction(async prisma => {
        await this.lessonRepository.deleteLessonAndRelatedEntities(id);
      })
      .catch(error => {
        throw new Error(`Failed to delete lesson and its related entities: ${error.message}`);
      });
  }

  async updateLesson(id: string, data: UpdateLesson): Promise<any> {
    return await this.prisma.$transaction(async prisma => {
      await this.lessonRepository.updateLesson(id, data);

      return this.lessonRepository.findLessonById(id);
    });
  }

  async getLesson(lessonId: string): Promise<any> {
    const lesson = await this.lessonRepository.findLessonById(lessonId);

    return {
      ...lesson,
      isHasLessonTask: lesson.lessonTasks && lesson.lessonTasks.length > 0,
    };
  }

  async getAllLessons(subtopicId: string): Promise<any> {
    const lessons = await this.lessonRepository.findAllLessons(subtopicId);

    return lessons.map(lesson => ({
      ...lesson,
      isHasLessonTask: lesson.lessonTasks && lesson.lessonTasks.length > 0,
    }));
  }

  async findLessonById(lessonId: string): Promise<any> {
    return this.lessonRepository.findLessonById(lessonId);
  }

  async findAllLessons(subtopicId: string): Promise<any> {
    return this.lessonRepository.findAllLessons(subtopicId);
  }

  async createLessonWithAI(userId: string, dto: LessonWithAIInput, pubSub: PubSub): Promise<any> {
    const chatWithAI = await this.prisma.chatWithAI.findUnique({ where: { id: dto.chatWithAIId } });
    if (!chatWithAI) {
      throw new Error(`Chat with AI ID ${dto.chatWithAIId} not found.`);
    }

    const messagesHistory = await this.prisma.messageWithAI.findMany({
      where: { chatWithAIId: dto.chatWithAIId },
      orderBy: {
        createdAt: "asc",
      },
    });
    const aiDto: AIDTO = {
      content: {
        createType: "Урок",
        descriptionType: "Создай урок",
        lessonTitle: dto.name,
        lessonDescription: dto.description,
        additionalParams: dto.additionalParams,
        isHasVideo: dto.isHasVideo,
        isHasAISearchImage: dto.isHasAISearchImage,
      },
      messagesHistory,
    };
    const fullContent = await this.eduAiService.getAIModelAnswer(dto.chatWithAIId, userId, aiDto, "EduAI", pubSub);
    if (!fullContent) throw new Error("Failed to get content from AI service.");
    const lessonJson = this.extractLessonJson(fullContent);

    const parsedContent = JSON.parse(lessonJson);
    console.log("parsedContent", parsedContent);

    await this.lessonRepository.validateSubtopic(dto.subtopicId);

    return await this.createLessonFromAI({
      name: dto.description,
      description: dto.description,
      courseId: dto.courseId,
      ...parsedContent,
      subtopicId: dto.subtopicId,
    });
  }

  async createLessonFromAI(data: LessonWithAITasksBlocksInput): Promise<any> {
    return await this.prisma.$transaction(async prisma => {
      await this.lessonRepository.validateLesson(data);

      const newLesson = await this.lessonRepository.createLesson(data);

      const lessonBlocks = [];
      if (data.lessonBlocks) {
        for (const lessonBlock of data.lessonBlocks) {
          const newLessonBlock = await this.lessonBlockService.createLessonBlock({
            ...lessonBlock,
            lessonId: newLesson.id,
          });
          lessonBlocks.push(newLessonBlock);
        }
      }

      const lessonTasks = [];
      if (data.lessonTasks) {
        for (const lessonTask of data.lessonTasks) {
          const newLessonTask = await this.lessonTasksService.createLessonTask({
            name: lessonTask.name,
            lessonId: newLesson.id,
          });
          lessonTasks.push(newLessonTask);
        }
      }

      const lessonStats = await this.lessonUtils.calculateLessonStats(newLesson.id);
      console.log(`Total Blocks: ${lessonStats.totalBlocks}`);

      // Fetch the newly created lesson with lessonBlocks and tasks
      const createdLesson = await this.lessonRepository.findLessonById(newLesson.id);

      return createdLesson;
    });
  }

  private extractLessonJson(content: string): string {
    const patterns = [/```lesson\n```json\n([\s\S]*?)\n```\n```/, /```json\n```lesson\n([\s\S]*?)\n```\n```/, /```lesson\n([\s\S]*?)\n```/, /```json\n([\s\S]*?)\n```/];
    let match = null;
    for (const pattern of patterns) {
      match = content.match(pattern);
      if (match && match.length >= 2) {
        break;
      }
    }
    if (!match || match.length < 2) {
      throw new Error("Cannot find lesson JSON in the provided content.");
    }
    let lessonJson = match[1];
    console.log(lessonJson);
    if (lessonJson.trim().startsWith("json")) {
      lessonJson = lessonJson.replace(/^json\s*/, "");
    }
    console.log(lessonJson);
    try {
      JSON.parse(lessonJson);
    } catch (e) {
      throw new Error("Extracted content is not valid JSON.");
    }

    return lessonJson;
  }

  async stopGeneration(conversationId: string): Promise<void> {
    this.eduAiService.stopGeneration(conversationId);
  }
}
