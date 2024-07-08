import { EduAiService } from "@/edu-ai/edu-ai.service";
import { AIDTO } from "@/edu-ai/types/ai.types";
import { PrismaService } from "@/prisma.service";
import { Injectable } from "@nestjs/common";
import { PubSub } from "graphql-subscriptions";
import { CoursePlanInput, CoursePlanWithAIInput } from "./dto/plan.input";
import { PlanRepository } from "./plan.repository";
import { PlanUtils } from "./plan.utils";
import { CoursePlan } from "@/plan/entities/plan.entity";

@Injectable()
export class PlanService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eduAiService: EduAiService,
    private readonly planRepository: PlanRepository,
    private readonly planUtils: PlanUtils,
  ) {}

  async createPlan(data: CoursePlanInput): Promise<CoursePlan> {
    const newPlan = await this.planRepository.createFullPlan(data);
    if (!newPlan.topics || newPlan.topics.length === 0) {
      throw new Error("No topics found in the created plan");
    }
    return newPlan;
  }

  async updatePlan(id: string, data: CoursePlanInput): Promise<any> {
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

  async createPlanWithAI(userId: string, dto: CoursePlanWithAIInput, pubSub: PubSub): Promise<any> {
    const messagesHistory = await this.prisma.messageWithAI.findMany({
      where: { chatWithAIId: dto.chatWithAIId },
      orderBy: {
        createdAt: "asc",
      },
    });
    const aiDto: AIDTO = {
      content: {
        createType: "План",
        descriptionType: "Создай план",
        planTitle: dto.name,
        planDescription: dto.description,
        isHasVideo: dto.isHasVideo,
        additionalParams: dto.additionalParams,
      },
      messagesHistory,
    };
    console.log("aiDto", aiDto);

    const fullContent = await this.eduAiService.getAIModelAnswer(dto.chatWithAIId, userId, aiDto, "EduAI", pubSub);
    if (!fullContent) throw new Error("Failed to get content from AI service.");
    const planJson = this.extractPlanJson(fullContent);

    const parsedContent = JSON.parse(planJson);
    console.log("parsedContent", parsedContent);

    const plan = await this.createPlan({
      name: dto.name,
      description: dto.description,
      courseId: dto.courseId,
      topics: JSON.parse(JSON.stringify(parsedContent.topics)),
    });
    console.log("PLENNS", plan);
    return plan;
  }

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
    console.log("VISISISISI", planJson);
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
