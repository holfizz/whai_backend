import { EduAiService } from "@/edu-ai/edu-ai.service";
import { PrismaService } from "@/prisma.service";
import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { LessonTasksResolver } from "./lesson-tasks.resolver";
import { LessonTasksService } from "./lesson-tasks.service";

@Module({
  imports: [HttpModule],
  providers: [LessonTasksResolver, LessonTasksService, PrismaService, EduAiService],
})
export class LessonTasksModule {}
