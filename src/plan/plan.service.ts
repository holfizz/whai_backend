import { EduAiService } from "@/edu-ai/edu-ai.service";
import { AIDTO } from "@/edu-ai/types/ai.types";
import logger from "@/helpers/logger";
import { CoursePlan } from "@/plan/entities/plan.entity";
import { PrismaService } from "@/prisma.service";
import { Injectable } from "@nestjs/common";
import { PubSub } from "graphql-subscriptions";
import { CoursePlanInput, CoursePlanWithAIInput } from "./dto/plan.input";
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

  async createPlan(data: CoursePlanInput): Promise<CoursePlan> {
    await this.prisma.course.update({
      where: { id: data.courseId },
      data: {
        name: data.name,
        description: data.description,
      },
    });
    const newPlan = await this.planRepository.createFullPlan(data);
    if (!newPlan.topics || newPlan.topics.length === 0) {
      throw new Error("No topics found in the created plan");
    }
    return newPlan;
  }

  async updatePlan(id: string, data: CoursePlanInput): Promise<CoursePlan> {
    await this.prisma.course.update({
      where: { id: data.courseId },
      data: {
        name: data.name,
        description: data.description,
      },
    });

    const updatedPlan = await this.planRepository.updatePlan(id, data);
    if (!updatedPlan) {
      throw new Error("Failed to update plan");
    }

    return updatedPlan;
  }

  async getCoursePlan(id: string): Promise<any> {
    return this.planRepository.findPlanById(id);
  }

  async findAllPlans(): Promise<any> {
    return this.planRepository.findAllPlans();
  }

  async createPlanWithAI(userId: string, dto: CoursePlanWithAIInput, pubSub: PubSub): Promise<any> {
    // Получение текущего значения currentCourseCount у пользователя
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { currentCourseCount: true },
    });

    if (!user) {
      throw new Error("User not found");
    }
    const activeSubscription = await this.prisma.subscriptionHistory.findFirst({
      where: {
        userId,
        endedAt: { gte: new Date() },
      },
    });

    if (user.currentCourseCount <= 0 && !activeSubscription) {
      throw new Error("You have reached your course creation limit for this month.");
    }
    // const courseAIHistory = await this.prisma.courseAIHistory.findUnique({
    //   where: { id: dto.courseAIHistoryId },
    // });

    // if (!courseAIHistory) {
    //   throw new Error(`courseAIHistory with ID ${dto.courseAIHistoryId} not found.`);
    // }
    const aiDto: AIDTO = {
      content: {
        createType: "План",
        userKnowledge: dto.userKnowledge,
        descriptionType: "Создай план",
        planTitle: dto.name,
        planDescription: dto.description,
        isHasVideo: dto.isHasVideo,
        additionalParams: dto.additionalParams,
      },
    };

    const fullContent = await this.eduAiService.getAIModelAnswer(null, userId, aiDto, "EduAI", pubSub);
    if (!fullContent) throw new Error("Failed to get content from AI service.");

    const planJson = this.extractPlanJson(fullContent);
    const parsedContent = JSON.parse(planJson);
    logger.log("parsedContent", parsedContent);

    // Сохранение AI сообщения
    await this.prisma.messageWithAI.create({
      data: {
        content: JSON.stringify(parsedContent),
        courseAIHistoryId: dto.courseAIHistoryId,
      },
    });

    // Создание плана курса
    const plan = await this.createPlan({
      name: dto.name,
      description: dto.description,
      courseId: dto.courseId,
      topics: JSON.parse(JSON.stringify(parsedContent.topics)),
    });

    // Уменьшение currentCourseCount на 1
    const updatedCourseCount = user.currentCourseCount - 1;

    // Обновление пользователя с новым значением currentCourseCount
    await this.prisma.user.update({
      where: { id: userId },
      data: { currentCourseCount: updatedCourseCount },
    });

    return plan;
  }

  private extractPlanJson(content: string): string {
    const quizPattern = /```plan([\s\S]*?)```/;
    const jsonPattern = /```json([\s\S]*?)```/;
    let match = content.match(quizPattern);
    if (!match || match.length < 2) {
      console.error("Cannot find quiz block in the provided content.");
      throw new Error("Cannot find quiz block in the provided content.");
    }
    let planContent = match[1].trim();
    let jsonMatch = planContent.match(jsonPattern);
    if (jsonMatch && jsonMatch.length >= 2) {
      planContent = jsonMatch[1].trim();
    } else {
      jsonMatch = content.match(jsonPattern);
      if (jsonMatch && jsonMatch.length >= 2) {
        planContent = jsonMatch[1].trim();
      }
    }
    try {
      JSON.parse(planContent);
    } catch (e) {
      console.error("Extracted content is not valid JSON:", planContent);
      throw new Error("Extracted content is not valid JSON.");
    }
    return planContent;
  }
}
