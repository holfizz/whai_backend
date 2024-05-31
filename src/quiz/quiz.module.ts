import { EduAiModule } from "@/edu-ai/edu-ai.module";
import { EduAiService } from "@/edu-ai/edu-ai.service";
import { PrismaService } from "@/prisma.service";
import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { QuizResolver } from "./quiz.resolver";
import { QuizService } from "./quiz.service";

@Module({
  providers: [QuizResolver, QuizService, PrismaService, EduAiService],
  imports: [EduAiModule, HttpModule],
})
export class QuizModule {}
