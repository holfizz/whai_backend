import { PrismaService } from "@/prisma.service";
import { Injectable, NotFoundException } from "@nestjs/common";
import { LessonInput } from "./dto/lesson.input";
import { UpdateLesson } from "./dto/update-lesson.input";

@Injectable()
export class LessonService {
  constructor(private prisma: PrismaService) {}

  async createLesson(data: LessonInput) {
    return this.prisma.lesson.create({
      data: {
        ...data,
      },
    });
  }

  async updateLesson(id: string, data: UpdateLesson) {
    const lesson = await this.prisma.lesson.findUnique({ where: { id } });
    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${id} not found`);
    }
    return this.prisma.lesson.update({ where: { id }, data });
  }

  async deleteLesson(id: string) {
    const lesson = await this.prisma.lesson.findUnique({ where: { id } });
    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${id} not found`);
    }
    await this.prisma.lessonBlock.deleteMany({ where: { lessonId: id } });
    await this.prisma.lessonTask.deleteMany({ where: { lessonId: id } });
    return this.prisma.lesson.delete({ where: { id } });
  }
}
