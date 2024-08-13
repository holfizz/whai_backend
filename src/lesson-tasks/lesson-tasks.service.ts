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
        name: data.name,
        lessonId: data.lessonId,
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

  async getAllTasksByLessonId(lessonId: string) {
    const lesson = await this.prisma.lesson.findUnique({ where: { id: lessonId } });
    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${lessonId} not found`);
    }
    return await this.prisma.lessonTask.findMany({ where: { lessonId } });
  }
}
