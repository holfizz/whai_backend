import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "@/prisma.service";
import { LessonPlanInput, PlanInput, QuizPlanInput, SubtopicPlanInput, TopicPlanInput } from "./dto/plan.input";
import { SubtopicService } from "@/subtopic/subtopic.service";
import { TopicService } from "@/topic/topic.service";
import { LessonService } from "@/lesson/lesson.service";

@Injectable()
export class PlanRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly topicService: TopicService,
    private readonly subtopicService: SubtopicService,
    private readonly lessonService: LessonService,
  ) {}

  async validatePlan(dto: PlanInput): Promise<void> {
    if (!dto.TopicPlans || dto.TopicPlans.length === 0) {
      throw new BadRequestException("TopicPlans must not be empty");
    }

    dto.TopicPlans.forEach(topicPlan => {
      if (!topicPlan.SubtopicPlans || topicPlan.SubtopicPlans.length === 0) {
        throw new BadRequestException(`SubtopicPlans in topic ${topicPlan.title} must not be empty`);
      }

      topicPlan.SubtopicPlans.forEach(subtopicPlan => {
        // Если у подтемы есть QuizPlan, но нет LessonPlans, это допустимо
        if (!subtopicPlan.LessonPlans || subtopicPlan.LessonPlans.length === 0) {
          if (!subtopicPlan.QuizPlan) {
            throw new BadRequestException(`LessonPlans in subtopic ${subtopicPlan.title} must not be empty`);
          }
        }
      });
    });
  }

  async createFullPlan(data: PlanInput): Promise<any> {
    return await this.prisma.$transaction(async prisma => {
      const newPlan = await this.createPlan(data);

      const topicPlans = await Promise.all(
        data.TopicPlans.map(async topicPlan => {
          const newTopicPlan = await this.createTopicPlan({ ...topicPlan, courseId: data.courseId }, newPlan.id);

          const subtopicPlans = await Promise.all(
            topicPlan.SubtopicPlans.map(async subtopicPlan => {
              const newSubtopicPlan = await this.createSubtopicPlan(
                {
                  ...subtopicPlan,
                  topicId: newTopicPlan.topicId,
                },
                newTopicPlan.id,
              );

              const lessonPlans = subtopicPlan.LessonPlans
                ? await Promise.all(
                    subtopicPlan.LessonPlans.map(async lessonPlan => {
                      return await this.createLessonPlan(
                        {
                          ...lessonPlan,
                          courseId: data.courseId,
                          subtopicId: newSubtopicPlan.subtopicId,
                        },
                        newSubtopicPlan.id,
                      );
                    }),
                  )
                : [];

              const quizPlan = subtopicPlan.QuizPlan ? await this.createQuizPlan(subtopicPlan.QuizPlan, newSubtopicPlan.id) : null;

              return { ...newSubtopicPlan, LessonPlans: lessonPlans, QuizPlan: quizPlan };
            }),
          );

          return { ...newTopicPlan, SubtopicPlans: subtopicPlans };
        }),
      );

      return { ...newPlan, TopicPlans: topicPlans };
    });
  }

  async createPlan(dto: PlanInput): Promise<any> {
    console.log(dto);
    const plan = await this.prisma.plan.create({
      data: {
        courseId: dto.courseId,
        title: dto.title,
        description: dto.description,
      },
    });
    console.log(plan);
    return plan;
  }

  async createTopicPlan(dto: TopicPlanInput, planId: string): Promise<any> {
    const topic = await this.topicService.createTopic({
      name: dto.title,
      description: dto.description,
      courseId: dto.courseId,
    });

    return this.prisma.topicPlan.create({
      data: {
        title: dto.title,
        description: dto.description,
        CoursePlanId: planId,
        topicId: topic.id,
      },
    });
  }

  async createSubtopicPlan(dto: SubtopicPlanInput, topicPlanId: string): Promise<any> {
    const subtopic = await this.subtopicService.createSubtopic({
      name: dto.title,
      description: dto.description,
      topicId: dto.topicId,
    });

    return this.prisma.subtopicPlan.create({
      data: {
        title: dto.title,
        description: dto.description,
        topicPlanId: topicPlanId,
        subtopicId: subtopic.id,
      },
    });
  }

  async createLessonPlan(dto: LessonPlanInput, subtopicPlanId: string): Promise<any> {
    const lesson = await this.lessonService.createLesson({
      name: dto.title,
      description: dto.description,
      subtopicId: dto.subtopicId,
      types: dto.icons,
      courseId: dto.courseId,
    });

    return this.prisma.lessonPlan.create({
      data: {
        title: dto.title,
        description: dto.description,
        SubtopicPlanId: subtopicPlanId,
        lessonId: lesson.id,
      },
    });
  }

  async createQuizPlan(data: QuizPlanInput, subtopicPlanId: string): Promise<any> {
    return this.prisma.quizPlan.create({
      data: {
        title: data.title,
        description: data.description,
        subtopicPlanId: subtopicPlanId,
      },
    });
  }

  async updatePlan(id: string, dto: PlanInput): Promise<void> {
    const existingPlan = await this.prisma.plan.findUnique({ where: { id } });
    if (!existingPlan) throw new Error("Plan not found.");

    await this.prisma.plan.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
      },
    });

    const existingTopics = await this.prisma.topicPlan.findMany({ where: { CoursePlanId: id } });
    for (const topicPlan of existingTopics) {
      const subtopics = await this.prisma.subtopicPlan.findMany({ where: { topicPlanId: topicPlan.id } });
      for (const subtopicPlan of subtopics) {
        await this.prisma.lessonPlan.deleteMany({ where: { SubtopicPlanId: subtopicPlan.id } });
        await this.prisma.subtopicPlan.delete({ where: { id: subtopicPlan.id } });
      }
      await this.prisma.topicPlan.delete({ where: { id: topicPlan.id } });
    }

    for (const topicPlan of dto.TopicPlans) {
      const newTopicPlan = await this.createTopicPlan(topicPlan, id);
      for (const subtopicPlan of topicPlan.SubtopicPlans) {
        const newSubtopicPlan = await this.createSubtopicPlan(subtopicPlan, newTopicPlan.id);
        for (const lessonPlan of subtopicPlan.LessonPlans) {
          await this.createLessonPlan(lessonPlan, newSubtopicPlan.id);
        }
      }
    }
  }

  async findPlanById(id: string): Promise<any> {
    return this.prisma.plan.findUnique({
      where: { id },
      include: {
        TopicPlans: {
          include: {
            SubtopicPlans: {
              include: {
                LessonPlans: true,
              },
            },
          },
        },
      },
    });
  }

  async findAllPlans(): Promise<any> {
    return this.prisma.plan.findMany({
      include: {
        TopicPlans: {
          include: {
            SubtopicPlans: {
              include: {
                LessonPlans: true,
              },
            },
          },
        },
      },
    });
  }

  async deletePlanAndRelatedEntities(planId: string): Promise<void> {
    const topics = await this.prisma.topicPlan.findMany({ where: { CoursePlanId: planId } });
    for (const topicPlan of topics) {
      const subtopics = await this.prisma.subtopicPlan.findMany({ where: { topicPlanId: topicPlan.id } });
      for (const subtopicPlan of subtopics) {
        await this.prisma.lessonPlan.deleteMany({ where: { SubtopicPlanId: subtopicPlan.id } });
        await this.prisma.subtopicPlan.delete({ where: { id: subtopicPlan.id } });
      }
      await this.prisma.topicPlan.delete({ where: { id: topicPlan.id } });
    }
    await this.prisma.plan.delete({ where: { id: planId } });
  }
}
