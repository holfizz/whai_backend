import { PrismaService } from "@/prisma.service";
import { Injectable, NotFoundException } from "@nestjs/common";
import { LessonBlockInput } from "./dto/lesson-block.input";
import { UpdateLessonBlock } from "./dto/update-lesson-block.input";

@Injectable()
export class LessonBlockService {
  constructor(private prisma: PrismaService) {}

  async createLessonBlock(data: LessonBlockInput) {
    return this.prisma.lessonBlock.create({
      data: {
        ...data,
      },
    });
  }

  async updateLessonBlock(id: string, data: UpdateLessonBlock) {
    const lesson = await this.prisma.lessonBlock.findUnique({ where: { id } });
    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${id} not found`);
    }
    return this.prisma.lessonBlock.update({ where: { id }, data });
  }

  async deleteLessonBlock(id: string) {
    const lesson = await this.prisma.lessonBlock.findUnique({ where: { id } });
    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${id} not found`);
    }
    await this.prisma.lessonBlock.deleteMany({ where: { id } });
  }
}
