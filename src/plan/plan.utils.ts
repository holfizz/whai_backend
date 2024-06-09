import { PrismaService } from "@/prisma.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class PlanUtils {
  constructor(private prisma: PrismaService) {}

  async calculatePlanStats(planId: string): Promise<{ totalModules: number }> {
    const totalModules = await this.prisma.modulePlan.count({
      where: { CoursePlanId: planId },
    });
    return { totalModules };
  }
}
