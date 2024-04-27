import { PrismaService } from "@/prisma.service";
import { Module } from "@nestjs/common";
import { QuizResolver } from "./quiz.resolver";
import { QuizService } from "./quiz.service";

@Module({
  providers: [QuizResolver, QuizService, PrismaService],
})
export class QuizModule {}
