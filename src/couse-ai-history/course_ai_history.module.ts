import { PrismaService } from "@/prisma.service";
import { Module } from "@nestjs/common";
import CourseAIHistoryService from "./course_ai_history.service";
import { CourseAIHistoryResolver } from "./course_ai_history.resolver";

@Module({
  providers: [CourseAIHistoryService, PrismaService, CourseAIHistoryResolver],
})
export class CourseAIHistoryModule {}
