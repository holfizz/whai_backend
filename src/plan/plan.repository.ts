import { PrismaService } from "@/prisma.service";
import { BadRequestException, Injectable } from "@nestjs/common";
import { LessonPlanInput, ModulePlanInput, PlanInput, QuizPlanInput, SubtopicPlanInput } from "./dto/plan.input";

@Injectable()
export class PlanRepository {
  constructor(private readonly prisma: PrismaService) {}

  async validatePlan(dto: PlanInput): Promise<void> {
    if (!dto.ModulePlans || dto.ModulePlans.length === 0) {
      throw new BadRequestException("ModulePlans must not be empty");
    }
    dto.ModulePlans.forEach(modulePlan => {
      if (!modulePlan.SubtopicPlans || modulePlan.SubtopicPlans.length === 0) {
        throw new BadRequestException(`SubtopicPlans in module ${modulePlan.title} must not be empty`);
      }
      modulePlan.SubtopicPlans.forEach(subtopicPlan => {
        if (!subtopicPlan.LessonPlans || subtopicPlan.LessonPlans.length === 0) {
          throw new BadRequestException(`LessonPlans in subtopic ${subtopicPlan.title} must not be empty`);
        }
      });
    });
  }

  async createPlan(dto: PlanInput): Promise<any> {
    return this.prisma.plan.create({
      data: {
        title: dto.title,
        description: dto.description,
      },
    });
  }

  async createModulePlan(dto: ModulePlanInput, planId: string): Promise<any> {
    return this.prisma.modulePlan.create({
      data: {
        title: dto.title,
        description: dto.description,
        CoursePlanId: planId,
      },
    });
  }

  async createSubtopicPlan(dto: SubtopicPlanInput, modulePlanId: string): Promise<any> {
    return this.prisma.subtopicPlan.create({
      data: {
        title: dto.title,
        description: dto.description,
        ModulePlanId: modulePlanId,
      },
    });
  }

  async createLessonPlan(dto: LessonPlanInput, subtopicPlanId: string): Promise<any> {
    return this.prisma.lessonPlan.create({
      data: {
        title: dto.title,
        description: dto.description,
        SubtopicPlanId: subtopicPlanId,
        icons: dto.icons,
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

    const existingModules = await this.prisma.modulePlan.findMany({ where: { CoursePlanId: id } });
    for (const modulePlan of existingModules) {
      const subtopics = await this.prisma.subtopicPlan.findMany({ where: { ModulePlanId: modulePlan.id } });
      for (const subtopicPlan of subtopics) {
        await this.prisma.lessonPlan.deleteMany({ where: { SubtopicPlanId: subtopicPlan.id } });
        await this.prisma.subtopicPlan.delete({ where: { id: subtopicPlan.id } });
      }
      await this.prisma.modulePlan.delete({ where: { id: modulePlan.id } });
    }

    for (const modulePlan of dto.ModulePlans) {
      const newModulePlan = await this.createModulePlan(modulePlan, id);
      for (const subtopicPlan of modulePlan.SubtopicPlans) {
        const newSubtopicPlan = await this.createSubtopicPlan(subtopicPlan, newModulePlan.id);
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
        ModulePlans: {
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
        ModulePlans: {
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
    const modules = await this.prisma.modulePlan.findMany({ where: { CoursePlanId: planId } });
    for (const modulePlan of modules) {
      const subtopics = await this.prisma.subtopicPlan.findMany({ where: { ModulePlanId: modulePlan.id } });
      for (const subtopicPlan of subtopics) {
        await this.prisma.lessonPlan.deleteMany({ where: { SubtopicPlanId: subtopicPlan.id } });
        await this.prisma.subtopicPlan.delete({ where: { id: subtopicPlan.id } });
      }
      await this.prisma.modulePlan.delete({ where: { id: modulePlan.id } });
    }
    await this.prisma.plan.delete({ where: { id: planId } });
  }
}
