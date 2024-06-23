import { PrismaService } from "@/prisma.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class LessonUtils {
  constructor(private readonly prisma: PrismaService) {}

  async calculateLessonStats(lessonId: string): Promise<any> {
    const totalBlocks = await this.prisma.lessonBlock.count({ where: { lessonId } });
    return { totalBlocks };
  }
}
