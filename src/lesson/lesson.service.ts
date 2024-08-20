import { EduAiService } from "@/edu-ai/edu-ai.service";
import { AIDTO } from "@/edu-ai/types/ai.types";
import logger from "@/helpers/logger";
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
      await this.lessonRepository.updateLesson(data);

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
    const courseAIHistoryId = await this.prisma.courseAIHistory.findUnique({ where: { id: dto.courseAIHistoryId } });
    if (!courseAIHistoryId) {
      throw new Error(`Chat with AI ID ${dto.courseAIHistoryId} not found.`);
    }
    const course = await this.prisma.course.findUnique({ where: { id: dto.courseId } });
    if (!course) {
      throw new Error(`course with ID ${dto.courseId} not found.`);
    }
    const aiDto: AIDTO = {
      content: {
        createType: "Урок",
        descriptionType: "Создай урок",
        courseTitle: course.name,
        courseDescription: course.description,
        lessonTitle: dto.name,
        lessonDescription: dto.description,
        additionalParams: dto.additionalParams,
        isHasVideo: course.isHasVideo,
        isHasAISearchImage: course.isHasAISearchImage,
      },
    };
    const fullContent = await this.eduAiService.getAIModelAnswer(dto.courseAIHistoryId, userId, aiDto, "EduAI", pubSub);
    if (!fullContent) throw new Error("Failed to get content from AI service.");
    const lessonJson = this.extractLessonJson(fullContent);

    const parsedContent = JSON.parse(lessonJson);
    logger.log("parsedContent", parsedContent);

    await this.lessonRepository.validateSubtopic(dto.subtopicId);

    return await this.createLessonFromAI({
      id: dto.id,
      name: dto.name,
      description: dto.description,
      courseId: dto.courseId,
      ...parsedContent,
      subtopicId: dto.subtopicId,
    });
  }

  async createLessonFromAI(data: LessonWithAITasksBlocksInput): Promise<any> {
    return await this.prisma.$transaction(async prisma => {
      await this.lessonRepository.validateLesson(data);
      const currentLesson = data.id ? await this.lessonRepository.updateLesson(data) : await this.lessonRepository.createLesson(data);

      const lessonBlocks = [];
      if (data.lessonBlocks) {
        for (const lessonBlock of data.lessonBlocks) {
          const newLessonBlock = await this.lessonBlockService.createLessonBlock({
            ...lessonBlock,
            lessonId: currentLesson.id,
          });
          lessonBlocks.push(newLessonBlock);
        }
      }

      const lessonTasks = [];
      if (data.lessonTasks) {
        for (const lessonTask of data.lessonTasks) {
          const newLessonTask = await this.lessonTasksService.createLessonTask({
            name: lessonTask.name,
            lessonId: currentLesson.id,
          });
          lessonTasks.push(newLessonTask);
        }
      }

      const lessonStats = await this.lessonUtils.calculateLessonStats(currentLesson.id);
      logger.log(`Total Blocks: ${lessonStats.totalBlocks}`);

      // Fetch the newly created lesson with lessonBlocks and tasks
      const createdLesson = await this.lessonRepository.findLessonById(currentLesson.id);

      return createdLesson;
    });
  }

  private extractLessonJson(content: string): string {
    const quizPattern = /```lesson([\s\S]*?)```/;
    const jsonPattern = /```json([\s\S]*?)```/;
    let quizMatch = content.match(quizPattern);
    if (!quizMatch || quizMatch.length < 2) {
      console.error("Cannot find quiz block in the provided content.");
      throw new Error("Cannot find quiz block in the provided content.");
    }
    let lessonContent = quizMatch[1].trim();
    let jsonMatch = lessonContent.match(jsonPattern);
    if (jsonMatch && jsonMatch.length >= 2) {
      lessonContent = jsonMatch[1].trim();
    } else {
      jsonMatch = content.match(jsonPattern);
      if (jsonMatch && jsonMatch.length >= 2) {
        lessonContent = jsonMatch[1].trim();
      }
    }
    try {
      JSON.parse(lessonContent);
    } catch (e) {
      console.error("Extracted content is not valid JSON:", lessonContent);
      throw new Error("Extracted content is not valid JSON.");
    }
    return lessonContent;
  }

  async stopGeneration(conversationId: string): Promise<void> {
    this.eduAiService.stopGeneration(conversationId);
  }
}
