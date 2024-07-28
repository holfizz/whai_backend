import { FileService } from "@/file/file.service";
import { PrismaService } from "@/prisma.service";
import { Module } from "@nestjs/common";
import { CourseResolver } from "./course.resolver";
import { CourseService } from "./course.service";

@Module({
  providers: [CourseResolver, CourseService, PrismaService, FileService],
})
export class CourseModule {}
