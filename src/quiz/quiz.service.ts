import { PrismaService } from "@/prisma.service";
import { Injectable } from "@nestjs/common";
import { QuizInput } from "./dto/quiz.input";

@Injectable()
export class QuizService {
  constructor(private prisma: PrismaService) {}

  async createQuiz(data: QuizInput) {
    // return this.prisma.quiz.create({});
  }

  async findAllQuizzes() {
    // return this.prisma.quiz.findMany();
  }

  async findQuizById(id: number) {
    // return this.prisma.quiz.findUnique({
    // where: { id },
    // });
  }

  async deleteQuiz(id: number) {
    // return this.prisma.quiz.delete({
    // where: { id },
    // });
  }

  async updateQuiz(id: number, data: QuizInput) {
    // return this.prisma.quiz.update({
    // where: { id },
    // data,
    // });
  }
}
