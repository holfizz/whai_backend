import { PrismaService } from "@/prisma.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class QuizUtils {
  constructor(private prisma: PrismaService) {}

  async calculateQuizStats(quizId: string): Promise<{ totalQuestions: number }> {
    const totalQuestions = await this.prisma.question.count({
      where: { quizId },
    });
    return { totalQuestions };
  }
}
