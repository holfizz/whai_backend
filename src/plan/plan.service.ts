import { EduAiService } from "@/edu-ai/edu-ai.service";
import { AIDTO } from "@/edu-ai/types/ai.types";
import { PrismaService } from "@/prisma.service";
import { Injectable } from "@nestjs/common";
import { PubSub } from "graphql-subscriptions";
import { PlanInput, PlanWithAIInput } from "./dto/plan.input";
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

          let quizPlan = null;
          if (subtopicPlan.QuizPlan) {
            quizPlan = await this.planRepository.createQuizPlan(subtopicPlan.QuizPlan, newSubtopicPlan.id);
          }

          subtopicPlans.push({ ...newSubtopicPlan, LessonPlans: lessonPlans, QuizPlan: quizPlan });
        }
        modulePlans.push({ ...newModulePlan, SubtopicPlans: subtopicPlans });
      }

      const planStats = await this.planUtils.calculatePlanStats(newPlan.id);
      console.log(`Total Modules: ${planStats.totalModules}`);

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

      return this.planRepository.findPlanById(id);
    });
  }

  async findPlanById(id: string): Promise<any> {
    return this.planRepository.findPlanById(id);
  }

  async findAllPlans(): Promise<any> {
    return this.planRepository.findAllPlans();
  }

  async createPlanWithAI(userId: string, dto: PlanWithAIInput, pubSub: PubSub): Promise<any> {
    const messagesHistory = await this.prisma.messageWithAI.findMany({
      where: { chatWithAIId: dto.chatWithAIId },
      orderBy: {
        createdAt: "asc",
      },
    });
    const aiDto: AIDTO = {
      content: dto.content,
      messagesHistory,
    };

    const fullContent = await this.eduAiService.getAIModelAnswer(dto.chatWithAIId, userId, aiDto, "EduAI", pubSub);
    if (!fullContent) throw new Error("Failed to get content from AI service.");
    console.log("fullContent", fullContent);
    const planJson = this.extractPlanJson(fullContent);
    console.log("planJson", planJson);

    const parsedContent = JSON.parse(planJson);
    console.log("parsedContent", parsedContent);

    await this.createPlan(parsedContent);

    return parsedContent;
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
}
