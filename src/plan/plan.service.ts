import { EduAiService } from "@/edu-ai/edu-ai.service";
import { PrismaService } from "@/prisma.service";
import { Injectable } from "@nestjs/common";
import { PlanInput } from "./dto/plan.input";
import { PlanRepository } from "./plan.repository";
import { PlanUtils } from "./plan.utils";

@Injectable()
export class PlanService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eduAiService: EduAiService,
    private readonly planRepository: PlanRepository,
    private readonly planUtils: PlanUtils,
  ) {}

  async createPlan(data: PlanInput): Promise<any> {
    return await this.prisma.$transaction(async prisma => {
      await this.planRepository.validatePlan(data);

      const newPlan = await this.planRepository.createPlan(data);

      const modulePlans = [];
      for (const modulePlan of data.ModulePlans) {
        const newModulePlan = await this.planRepository.createModulePlan(modulePlan, newPlan.id);
        const subtopicPlans = [];
        for (const subtopicPlan of modulePlan.SubtopicPlans) {
          const newSubtopicPlan = await this.planRepository.createSubtopicPlan(subtopicPlan, newModulePlan.id);
          const lessonPlans = [];
          for (const lessonPlan of subtopicPlan.LessonPlans) {
            const newLessonPlan = await this.planRepository.createLessonPlan(lessonPlan, newSubtopicPlan.id);
            lessonPlans.push(newLessonPlan);
          }
          subtopicPlans.push({ ...newSubtopicPlan, LessonPlans: lessonPlans });
        }
        modulePlans.push({ ...newModulePlan, SubtopicPlans: subtopicPlans });
      }

      // Рассчитаем статистику и выведем в лог или используем в бизнес-логике
      const planStats = await this.planUtils.calculatePlanStats(newPlan.id);
      console.log(`Total Modules: ${planStats.totalModules}`);

      // Возвращаем полный план с модулями, подтемами и уроками
      return { ...newPlan, ModulePlans: modulePlans };
    });
  }

  async deletePlan(id: string): Promise<any> {
    return await this.prisma
      .$transaction(async prisma => {
        await this.planRepository.deletePlanAndRelatedEntities(id);
      })
      .catch(error => {
        throw new Error(`Failed to delete plan and its related entities: ${error.message}`);
      });
  }

  async updatePlan(id: string, data: PlanInput): Promise<any> {
    return await this.prisma.$transaction(async prisma => {
      await this.planRepository.updatePlan(id, data);

      // Возвращаем обновленный план
      return this.planRepository.findPlanById(id);
    });
  }

  async findPlanById(id: string): Promise<any> {
    return this.planRepository.findPlanById(id);
  }

  async findAllPlans(): Promise<any> {
    return this.planRepository.findAllPlans();
  }

  private extractPlanJson(content: string): string {
    let match = content.match(/```plan\n([\s\S]*?)\n```/);
    if (!match || match.length < 2) throw new Error("Cannot find plan JSON in the provided content.");

    let planJson = match[1];

    if (planJson.startsWith("json")) {
      planJson = planJson.replace(/^json\s*/, "");
    }

    return planJson;
  }

  async stopGeneration(conversationId: string): Promise<void> {
    this.eduAiService.stopGeneration(conversationId);
  }

  // async createPlanWithAI(userId: string, dto: PlanInput, pubSub: PubSub): Promise<any> {
  //   const fullContent = await this.eduAiService.getAIModelAnswer(dto.chatWithAIId, userId, dto, "EduAI", pubSub);
  //   if (!fullContent) throw new Error("Failed to get content from AI service.");

  //   const planJson = this.extractPlanJson(fullContent);
  //   const parsedContent = JSON.parse(planJson);
  //   const { title, ModulePlans } = parsedContent;

  //   await this.createPlan({ title, ModulePlans });

  //   return parsedContent;
  // }
}
