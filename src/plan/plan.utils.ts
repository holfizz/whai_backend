import { PrismaService } from "@/prisma.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class PlanUtils {
  constructor(private prisma: PrismaService) {}

  async calculatePlanStats(courseId: string): Promise<{ totalTopics: number }> {
    const totalTopics = await this.prisma.topic.count({
      where: { courseId },
    });
    return { totalTopics };
  }
}
