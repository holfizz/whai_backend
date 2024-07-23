import { PrismaService } from "@/prisma.service";
import { Injectable, NotFoundException } from "@nestjs/common";
import { LessonBlockInput } from "./dto/lesson-block.input";
import { UpdateLessonBlock } from "./dto/update-lesson-block.input";

@Injectable()
export class LessonBlockService {
  constructor(private prisma: PrismaService) {}

  async createLessonBlock(data: LessonBlockInput) {
    // Check if the lessonId exists
    const lesson = await this.prisma.lesson.findUnique({ where: { id: data.lessonId } });
    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${data.lessonId} not found`);
    }

    return this.prisma.lessonBlock.create({
      data: {
        ...data,
      },
    });
  }

  async updateLessonBlock(data: UpdateLessonBlock) {
    // Check if the lesson block exists
    const lessonBlock = await this.prisma.lessonBlock.findUnique({ where: { id: data.id } });
    if (!lessonBlock) {
      throw new NotFoundException(`LessonBlock with ID ${data.id} not found`);
    }

    return this.prisma.lessonBlock.update({
      where: { id: data.id },
      data,
    });
  }

  async deleteLessonBlock(id: string) {
    // Check if the lesson block exists
    const lessonBlock = await this.prisma.lessonBlock.findUnique({ where: { id } });
    if (!lessonBlock) {
      throw new NotFoundException(`LessonBlock with ID ${id} not found`);
    }

    // Delete the lesson block
    return this.prisma.lessonBlock.delete({ where: { id } });
  }

  async findLessonBlockById(id: string) {
    const lessonBlock = await this.prisma.lessonBlock.findUnique({ where: { id } });
    if (!lessonBlock) {
      throw new NotFoundException(`LessonBlock with ID ${id} not found`);
    }
    return lessonBlock;
  }

  async findLessonBlocksByLessonId(lessonId: string) {
    const lesson = await this.prisma.lesson.findUnique({ where: { id: lessonId } });
    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${lessonId} not found`);
    }

    return this.prisma.lessonBlock.findMany({ where: { lessonId } });
  }
}
