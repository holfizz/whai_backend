import logger from "@/helpers/logger";
import { LessonService } from "@/lesson/lesson.service";
import { PrismaService } from "@/prisma.service";
import { QuizService } from "@/quiz/quiz.service";
import { SubtopicService } from "@/subtopic/subtopic.service";
import { TopicService } from "@/topic/topic.service";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { CoursePlanInput, LessonPlanInput, QuizPlanInput, SubtopicPlanInput, TopicPlanInput } from "./dto/plan.input";

@Injectable()
export class PlanRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly topicService: TopicService,
    private readonly subtopicService: SubtopicService,
    private readonly lessonService: LessonService,
    private readonly quizService: QuizService,
  ) {}

  async validatePlan(dto: CoursePlanInput): Promise<void> {
    if (!dto.topics || dto.topics.length === 0) {
      throw new BadRequestException("TopicPlans must not be empty");
    }

    dto.topics.forEach(topic => {
      if (!topic.subtopics || topic.subtopics.length === 0) {
        throw new BadRequestException(`SubtopicPlans in topic ${topic.name} must not be empty`);
      }

      topic.subtopics.forEach(subtopicPlan => {
        // Если у подтемы есть QuizPlan, но нет LessonPlans, это допустимо
        if (!subtopicPlan.lessons || subtopicPlan.lessons.length === 0) {
          if (!subtopicPlan.quizzes) {
            throw new BadRequestException(`LessonPlans in subtopic ${subtopicPlan.name} must not be empty`);
          }
        }
      });
    });
  }

  async createFullPlan(data: CoursePlanInput): Promise<any> {
    for (const topicInput of data.topics) {
      let existingTopic = await this.prisma.topic.findFirst({
        where: {
          name: topicInput.name,
          courseId: data.courseId,
        },
      });

      let newTopic;
      if (existingTopic) {
        newTopic = existingTopic;
      } else {
        newTopic = await this.createTopicPlan({
          name: topicInput.name,
          description: topicInput.description,
          courseId: data.courseId,
          completionTime: topicInput.completionTime,
        });
      }

      for (const subtopicInput of topicInput.subtopics) {
        const newSubtopic = await this.createSubtopicPlan({
          description: subtopicInput.description,
          name: subtopicInput.name,
          topicId: newTopic.id,
          completionTime: subtopicInput.completionTime,
        });

        for (const lessonInput of subtopicInput.lessons) {
          logger.log("Creating lesson with data:", JSON.stringify(lessonInput, null, 2));
          await this.createLessonPlan({
            name: lessonInput.name,
            description: lessonInput.description,
            types: lessonInput.types,
            subtopicId: newSubtopic.id,
            courseId: data.courseId,
          });
        }

        for (const quizInput of subtopicInput.quizzes) {
          logger.log("Creating quiz with data:", JSON.stringify(quizInput, null, 2));
          await this.createQuizPlan({
            name: quizInput.name,
            description: quizInput.description,
            subtopicId: newSubtopic.id,
            courseId: data.courseId,
          });
        }
      }
    }

    const coursePlan = await this.prisma.course.findUnique({
      where: { id: data.courseId },
      include: {
        topics: {
          include: {
            subtopics: {
              include: {
                lessons: true,
                quizzes: true,
              },
            },
          },
        },
      },
    });

    return coursePlan;
  }

  async createTopicPlan(dto: TopicPlanInput): Promise<any> {
    return await this.topicService.createTopic({
      name: dto.name,
      description: dto.description,
      courseId: dto.courseId,
    });
  }

  async createSubtopicPlan(dto: SubtopicPlanInput): Promise<any> {
    return await this.subtopicService.createSubtopic({
      name: dto.name,
      description: dto.description,
      topicId: dto.topicId,
    });
  }

  async createLessonPlan(dto: LessonPlanInput): Promise<any> {
    return await this.lessonService.createLesson({
      name: dto.name,
      description: dto.description,
      subtopicId: dto.subtopicId,
      types: dto.types,
      courseId: dto.courseId,
    });
  }

  async createQuizPlan(dto: QuizPlanInput): Promise<any> {
    return await this.quizService.createQuiz({
      name: dto.name,
      description: dto.description,
      subtopicId: dto.subtopicId,
      courseId: dto.courseId,
      isPlan: true,
    });
  }

  async updatePlan(id: string, dto: CoursePlanInput): Promise<any> {
    // Обновляем основную информацию о курсе
    await this.prisma.course.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
      },
    });

    // Удаляем старые данные
    await this.deleteOldPlanData(id);

    // Создаем новые данные
    for (const topicInput of dto.topics) {
      const newTopic = await this.createOrUpdateTopic(topicInput, id);

      for (const subtopicInput of topicInput.subtopics) {
        const newSubtopic = await this.createOrUpdateSubtopic(subtopicInput, newTopic.id);

        for (const lessonInput of subtopicInput.lessons) {
          await this.createOrUpdateLesson(lessonInput, newSubtopic.id, id);
        }

        for (const quizInput of subtopicInput.quizzes) {
          await this.createOrUpdateQuiz(quizInput, newSubtopic.id, id);
        }
      }
    }

    return this.findPlanById(id);
  }

  private async deleteOldPlanData(courseId: string): Promise<void> {
    const topics = await this.prisma.topic.findMany({ where: { courseId } });
    for (const topic of topics) {
      const subtopics = await this.prisma.subtopic.findMany({ where: { topicId: topic.id } });
      for (const subtopic of subtopics) {
        await this.prisma.lesson.deleteMany({ where: { subtopicId: subtopic.id } });
        await this.prisma.quiz.deleteMany({ where: { subtopicId: subtopic.id } });
        await this.prisma.subtopic.delete({ where: { id: subtopic.id } });
      }
      await this.prisma.topic.delete({ where: { id: topic.id } });
    }
  }

  private async createOrUpdateTopic(topicInput: TopicPlanInput, courseId: string): Promise<any> {
    return await this.prisma.topic.upsert({
      where: {
        id: topicInput.id || "", // Может быть пустой, если создается новый
      },
      update: {
        name: topicInput.name,
        description: topicInput.description,
      },
      create: {
        name: topicInput.name,
        description: topicInput.description,
        courseId,
      },
    });
  }

  private async createOrUpdateSubtopic(subtopicInput: SubtopicPlanInput, topicId: string): Promise<any> {
    return await this.prisma.subtopic.upsert({
      where: {
        id: subtopicInput.id || "", // Может быть пустой, если создается новый
      },
      update: {
        name: subtopicInput.name,
        description: subtopicInput.description,
        completionTime: subtopicInput.completionTime,
      },
      create: {
        name: subtopicInput.name,
        description: subtopicInput.description,
        topicId,
        completionTime: subtopicInput.completionTime,
      },
    });
  }

  private async createOrUpdateLesson(lessonInput: LessonPlanInput, subtopicId: string, courseId: string): Promise<any> {
    return await this.prisma.lesson.upsert({
      where: {
        id: lessonInput.id || "", // Может быть пустой, если создается новый
      },
      update: {
        name: lessonInput.name,
        description: lessonInput.description,
        types: lessonInput.types,
      },
      create: {
        name: lessonInput.name,
        description: lessonInput.description,
        types: lessonInput.types,
        subtopicId,
        courseId,
      },
    });
  }

  private async createOrUpdateQuiz(quizInput: QuizPlanInput, subtopicId: string, courseId: string): Promise<any> {
    return await this.prisma.quiz.upsert({
      where: {
        id: quizInput.id || "", // Может быть пустой, если создается новый
      },
      update: {
        name: quizInput.name,
        description: quizInput.description,
      },
      create: {
        name: quizInput.name,
        description: quizInput.description,
        subtopicId,
        courseId,
        isPlan: true,
      },
    });
  }

  async findPlanById(id: string): Promise<any> {
    const plan = this.prisma.course.findUnique({
      where: { id },
      include: {
        topics: {
          include: {
            subtopics: {
              include: {
                lessons: true,
                quizzes: true,
              },
            },
          },
        },
      },
    });
    if (!plan) {
      throw new NotFoundException(`Plan with ID ${id} not found`);
    }
    return plan;
  }

  async findAllPlans(): Promise<any> {
    return this.prisma.course.findMany({
      include: {
        topics: {
          include: {
            subtopics: {
              include: {
                lessons: true,
                quizzes: true,
              },
            },
          },
        },
      },
    });
  }
}
