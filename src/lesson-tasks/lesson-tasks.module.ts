import { PrismaService } from "@/prisma.service";
import { Module } from "@nestjs/common";
import { LessonTasksResolver } from "./lesson-tasks.resolver";
import { LessonTasksService } from "./lesson-tasks.service";

@Module({
  providers: [LessonTasksResolver, LessonTasksService, PrismaService],
})
export class LessonTasksModule {}
