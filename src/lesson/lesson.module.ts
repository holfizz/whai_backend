import { EduAiModule } from "@/edu-ai/edu-ai.module";
import { EduAiService } from "@/edu-ai/edu-ai.service";
import { LessonBlockService } from "@/lesson-block/lesson-block.service";
import { LessonTasksService } from "@/lesson-tasks/lesson-tasks.service";
import { PrismaService } from "@/prisma.service";
import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { LessonRepository } from "./lesson.repository";
import { LessonResolver } from "./lesson.resolver";
import { LessonService } from "./lesson.service";
import { LessonUtils } from "./lesson.utils";

@Module({
  providers: [LessonResolver, LessonService, PrismaService, EduAiService, LessonRepository, LessonUtils, LessonBlockService, LessonTasksService],
  imports: [EduAiModule, HttpModule],
  exports: [LessonModule],
})
export class LessonModule {}
