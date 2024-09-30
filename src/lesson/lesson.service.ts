import { EduAiService } from "@/edu-ai/edu-ai.service";
import { AIDTO } from "@/edu-ai/types/ai.types";
import logger from "@/helpers/logger";
import { LessonBlockService } from "@/lesson-block/lesson-block.service";
import { LessonTasksService } from "@/lesson-tasks/lesson-tasks.service";
import { PrismaService } from "@/prisma.service";
import { Injectable } from "@nestjs/common";
import { PubSub } from "graphql-subscriptions";
import { LessonIndependentWithAIInput, LessonInput, LessonWithAIInput, LessonWithAITasksBlocksInput } from "./dto/lesson.input";
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

  async updateLesson(data: UpdateLesson): Promise<any> {
    return this.lessonRepository.updateLesson(data);
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
    // Проверка наличия courseAIHistoryId
    const courseAIHistory = await this.prisma.courseAIHistory.findUnique({ where: { id: dto.courseAIHistoryId } });
    if (!courseAIHistory) {
      throw new Error(`Chat with AI ID ${dto.courseAIHistoryId} not found.`);
    }
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new Error(`User with ID ${userId} not found.`);
    }
    // Проверка наличия курса
    const course = await this.prisma.course.findUnique({ where: { id: dto.courseId } });
    if (!course) {
      throw new Error(`Course with ID ${dto.courseId} not found.`);
    }
    const isTrialExpired = user.trialEndsAt && new Date(user.trialEndsAt) < new Date();
    logger.log("!!user.currentSubscriptionType", !!user.currentSubscriptionType);
    if (!user.currentSubscriptionType || (course.isTrial && isTrialExpired)) {
      throw new Error(`Access to this trial course is denied. Your trial has expired or you already have an active subscription.`);
    }
    const lesson = await this.prisma.lesson.findUnique({ where: { id: dto.id } });
    if (!lesson) {
      throw new Error(`Lesson with ID ${dto.id} not found.`);
    }
    if (lesson.isAdditional && user.currentLessonCount <= 0) {
      throw new Error("You have reached your lesson creation limit for this month.");
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
        needHomework: course.needHomeworks,
      },
    };
    logger.log("aiDto", aiDto);

    const fullContent = await this.eduAiService.getAIModelAnswer(null, userId, aiDto, "EduAI", pubSub);
    if (!fullContent) throw new Error("Failed to get content from AI service.");

    const lessonJson = this.extractLessonJson(fullContent);
    const parsedContent = JSON.parse(lessonJson);
    logger.log("parsedContent", parsedContent);

    // Валидация подтемы
    await this.lessonRepository.validateSubtopic(dto.subtopicId);

    // Создание урока
    const createdLesson = await this.createLessonFromAI({
      id: dto.id,
      name: dto.name,
      description: dto.description,
      courseId: dto.courseId,
      ...parsedContent,
      subtopicId: dto.subtopicId,
    });

    if (lesson.isAdditional) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { currentLessonCount: { decrement: 1 } },
      });
    }

    if (!user.isFirstLessonCompleted) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { isFirstLessonCompleted: true },
      });
    }
    return createdLesson;
  }
  async createIndependentLessonWithAI(userId: string, dto: LessonIndependentWithAIInput, pubSub: PubSub): Promise<any> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new Error(`User with ID ${userId} not found.`);
    }

    if (user.currentLessonCount <= 0) {
      throw new Error("You have reached your lesson creation limit for this month.");
    }
    const aiDto: AIDTO = {
      content: {
        createType: "Урок",
        createDescription: "Создай урок на заданную тему",
        lessonTitle: dto.lessonTitle,
        lessonDescription: dto.lessonDescription,
        additionalParams: dto.additionalParams,
        isHasVideo: dto.isHasVideo,
        isHasAISearchImage: dto.isHasAISearchImage,
      },
    };
    logger.log("aiDto", aiDto);
    // Получение ответа от AI
    const fullContent = await this.eduAiService.getAIModelAnswer(null, userId, aiDto, "EduAI", pubSub);
    if (!fullContent) throw new Error("Failed to get content from AI service.");

    // Обработка и валидация данных урока
    const lessonJson = this.extractLessonJson(fullContent);
    const parsedContent = JSON.parse(lessonJson);

    // Проверка структуры данных parsedContent
    if (!parsedContent.lessonBlocks || !Array.isArray(parsedContent.lessonBlocks)) {
      throw new Error("Invalid lesson blocks data.");
    }
    const lesson = await this.prisma.lesson.create({
      data: {
        name: dto.lessonTitle,
        description: dto.lessonDescription,
        isAdditional: true,
        lessonBlocks: {
          create: parsedContent.lessonBlocks,
        },
        lessonTasks: {
          create: parsedContent.lessonTasks.map((task: any) => ({
            name: task.name,
            description: task.description,
          })),
        },
        User: { connect: { id: userId } },
      },
    });

    // Обновление текущего количества уроков у пользователя
    await this.prisma.user.update({
      where: { id: userId },
      data: { currentLessonCount: { decrement: 1 } },
    });

    return lesson;
  }

  async getAllIndependentLessons(userId: string): Promise<any[]> {
    const lessons = await this.prisma.lesson.findMany({
      where: {
        userId: userId,
        AND: [{ courseId: null }, { subtopicId: null }],
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        lessonBlocks: true,
        lessonTasks: true,
      },
    });
    return lessons.map(lesson => {
      const totalBlocks = lesson.lessonBlocks.length;
      const totalTasks = lesson.lessonTasks.length;

      return {
        id: lesson.id,
        name: lesson.name,
        description: lesson.description,
        lessonTasks: lesson.lessonTasks,
        totalBlocks,
        totalTasks,
      };
    });
  }

  async createLessonFromAI(data: LessonWithAITasksBlocksInput): Promise<any> {
    return await this.prisma.$transaction(async prisma => {
      await this.lessonRepository.validateLesson(data);
      const currentLesson = data.id
        ? await this.lessonRepository.updateLesson({ name: data.name, description: data.description, types: data.types, id: data.id })
        : await this.lessonRepository.createLesson(data);

      if (data.lessonBlocks) {
        for (const lessonBlock of data.lessonBlocks) {
          await this.lessonBlockService.createLessonBlock({
            ...lessonBlock,
            lessonId: currentLesson.id,
          });
        }
      }

      if (data.lessonTasks) {
        for (const lessonTask of data.lessonTasks) {
          await this.lessonTasksService.createLessonTask({
            name: lessonTask.name,
            description: lessonTask.description,
            lessonId: currentLesson.id,
          });
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
    const lessonPattern = /```lesson([\s\S]*?)```/;
    const jsonPattern = /```json([\s\S]*?)```/;
    let lessonMatch = content.match(lessonPattern);
    if (!lessonMatch || lessonMatch.length < 2) {
      console.error("Cannot find lesson block in the provided content.");
      throw new Error("Cannot find lesson block in the provided content.");
    }
    let lessonContent = lessonMatch[1].trim();
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

  async getPrevNextLesson(courseId: string, lessonId: string): Promise<{ prevLessonId: string | null; nextLessonId: string | null }> {
    const lessons = await this.prisma.lesson.findMany({
      where: { courseId },
      orderBy: { createdAt: "asc" },
      select: { id: true },
    });

    const currentIndex = lessons.findIndex(lesson => lesson.id === lessonId);

    if (currentIndex === -1) {
      throw new Error("Lesson not found in the course");
    }

    const prevLessonId = currentIndex > 0 ? lessons[currentIndex - 1].id : null;
    const nextLessonId = currentIndex < lessons.length - 1 ? lessons[currentIndex + 1].id : null;

    return { prevLessonId, nextLessonId };
  }

  async getBreadcrumbsToLesson({ courseId, topicId, subtopicId, lessonId }: { courseId: string; topicId: string; subtopicId: string; lessonId: string }): Promise<any> {
    const course = await this.prisma.course.findUnique({ where: { id: courseId } });
    const topic = await this.prisma.topic.findUnique({ where: { id: topicId } });
    const subtopic = await this.prisma.subtopic.findUnique({ where: { id: subtopicId } });
    const lesson = await this.prisma.lesson.findUnique({ where: { id: lessonId } });

    return {
      courseName: course.name,
      topicName: topic.name,
      subtopicName: subtopic.name,
      lessonName: lesson.name,
    };
  }
}
