import { PrismaService } from "@/prisma.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class PlanUtils {
  constructor(private prisma: PrismaService) {}

  async calculatePlanStats(planId: string): Promise<{ totalTopics: number }> {
    const totalTopics = await this.prisma.topicPlan.count({
      where: { CoursePlanId: planId },
    });
    return { totalTopics };
  }
}
