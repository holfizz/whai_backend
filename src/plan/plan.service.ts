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
      const newPlan = await this.planRepository.createFullPlan(data);
      return newPlan;
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
    const planJson = this.extractPlanJson(fullContent);

    const parsedContent = JSON.parse(planJson);
    console.log("parsedContent", parsedContent);
    console.log("plan", {
      title: parsedContent.title,
      TopicPlans: parsedContent.TopicPlans,
      courseId: dto.courseId,
      chatWithAIId: dto.chatWithAIId,
      description: parsedContent.description,
    });
    const plan = await this.createPlan({
      title: parsedContent.title,
      description: parsedContent.description,
      TopicPlans: parsedContent.TopicPlans,
      courseId: dto.courseId,
      chatWithAIId: dto.chatWithAIId,
    });
    return plan;
  }

  // private extractPlanJson(content: string): string {
  //   let match = content.match(/```plan\n([\s\S]*?)\n```/);
  //   if (!match || match.length < 2) throw new Error("Cannot find plan JSON in the provided content.");
  //
  //   let planJson = match[1];
  //
  //   if (planJson.startsWith("json")) {
  //     planJson = planJson.replace(/^json\s*/, "");
  //   }
  //
  //   return planJson;
  // }
  private extractPlanJson(content: string): string {
    const patterns = [/```plan\n```json\n([\s\S]*?)\n```\n```/, /```json\n```plan\n([\s\S]*?)\n```\n```/, /```plan\n([\s\S]*?)\n```/, /```json\n([\s\S]*?)\n```/];
    let match = null;
    for (const pattern of patterns) {
      match = content.match(pattern);
      if (match && match.length >= 2) {
        break;
      }
    }
    if (!match || match.length < 2) {
      throw new Error("Cannot find plan JSON in the provided content.");
    }
    let planJson = match[1];
    console.log(planJson);
    if (planJson.trim().startsWith("json")) {
      planJson = planJson.replace(/^json\s*/, "");
    }
    console.log(planJson);
    try {
      JSON.parse(planJson);
    } catch (e) {
      throw new Error("Extracted content is not valid JSON.");
    }

    return planJson;
  }

  async stopGeneration(conversationId: string): Promise<void> {
    this.eduAiService.stopGeneration(conversationId);
  }
}
