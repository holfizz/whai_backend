import { AuthModule } from "@/auth/auth.module";
import { EduAiService } from "@/edu-ai/edu-ai.service";
import { PrismaService } from "@/prisma.service";
import { TelegramModule } from "@/telegram/telegram.module";
import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { LessonTasksResolver } from "./lesson-tasks.resolver";
import { LessonTasksService } from "./lesson-tasks.service";

@Module({
  imports: [HttpModule, TelegramModule, AuthModule],
  providers: [LessonTasksResolver, LessonTasksService, PrismaService, EduAiService, TelegramModule],
})
export class LessonTasksModule {}
