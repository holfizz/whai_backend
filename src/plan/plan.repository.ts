import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "@/prisma.service";
import { CoursePlanInput, LessonPlanInput, QuizPlanInput, SubtopicPlanInput, TopicPlanInput } from "./dto/plan.input";
import { SubtopicService } from "@/subtopic/subtopic.service";
import { TopicService } from "@/topic/topic.service";
import { LessonService } from "@/lesson/lesson.service";
import { QuizService } from "@/quiz/quiz.service";

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
        });
      }

      for (const subtopicInput of topicInput.subtopics) {
        const newSubtopic = await this.createSubtopicPlan({
          description: subtopicInput.description,
          name: subtopicInput.name,
          topicId: newTopic.id,
        });

        for (const lessonInput of subtopicInput.lessons) {
          console.log("Creating lesson with data:", JSON.stringify(lessonInput, null, 2));
          await this.createLessonPlan({
            name: lessonInput.name,
            description: lessonInput.description,
            types: lessonInput.types,
            subtopicId: newSubtopic.id,
            courseId: data.courseId,
          });
        }

        for (const quizInput of subtopicInput.quizzes) {
          console.log("Creating quiz with data:", JSON.stringify(quizInput, null, 2));
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

  async updatePlan(id: string, dto: CoursePlanInput): Promise<void> {
    await this.prisma.course.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
      },
    });

    const existingTopics = await this.prisma.topic.findMany({ where: { courseId: id } });
    for (const topicPlan of existingTopics) {
      const subtopics = await this.prisma.subtopic.findMany({ where: { topicId: topicPlan.id } });
      for (const subtopicPlan of subtopics) {
        await this.prisma.lesson.deleteMany({ where: { subtopicId: subtopicPlan.id } });
        await this.prisma.subtopic.delete({ where: { id: subtopicPlan.id } });
      }
      await this.prisma.topic.delete({ where: { id: topicPlan.id } });
    }
    //TITLE:something strange
    // for (const topic of dto.topics) {
    //   const newTopicPlan = await this.createTopicPlan(topic);
    //   for (const subtopicPlan of topic.subtopics) {
    //     const newSubtopicPlan = await this.createSubtopicPlan(subtopicPlan);
    //     for (const lessonPlan of subtopicPlan.lessons) {
    //       await this.lessonService.createLesson({
    //         name: dto.name,
    //         description: dto.description,
    //         subtopicId: newSubtopicPlan.id,
    //         types: [],
    //         courseId: dto.courseId,
    //       });
    //     }
    //   }
    // }
  }

  async findPlanById(id: string): Promise<any> {
    return this.prisma.course.findUnique({
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
