import { PrismaService } from "@/prisma.service";
import { Module } from "@nestjs/common";
import { LessonBlockResolver } from "./lesson-block.resolver";
import { LessonBlockService } from "./lesson-block.service";

@Module({
  providers: [LessonBlockResolver, LessonBlockService, PrismaService],
})
export class LessonBlockModule {}
