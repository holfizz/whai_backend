import { PrismaService } from "@/prisma.service";
import { Module } from "@nestjs/common";
import { LessonResolver } from "./lesson.resolver";
import { LessonService } from "./lesson.service";

@Module({
  providers: [LessonResolver, LessonService, PrismaService],
})
export class LessonModule {}
