import { PrismaService } from "@/prisma.service";
import { Injectable, NotFoundException } from "@nestjs/common";
import { LessonTasksInput } from "./dto/lesson-task.input";
import { UpdateLessonTasks } from "./dto/update-lesson-task.input";

@Injectable()
export class LessonTasksService {
  constructor(private prisma: PrismaService) {}
  async createLessonTask(data: LessonTasksInput) {
    return this.prisma.lessonTask.create({
      data: {
        ...data,
      },
    });
  }
  async updateLessonTask(id: string, data: UpdateLessonTasks) {
    const lesson = await this.prisma.lessonTask.findUnique({ where: { id } });
    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${id} not found`);
    }
    return this.prisma.lessonTask.update({ where: { id }, data });
  }

  async deleteLessonTask(id: string) {
    const lesson = await this.prisma.lessonTask.findUnique({ where: { id } });
    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${id} not found`);
    }
    await this.prisma.lessonTask.deleteMany({ where: { id } });
  }
}
