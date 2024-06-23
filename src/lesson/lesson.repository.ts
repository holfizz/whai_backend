import { PrismaService } from "@/prisma.service";
import { Injectable, NotFoundException } from "@nestjs/common";
import { LessonInput } from "./dto/lesson.input";
import { UpdateLesson } from "./dto/update-lesson.input";

@Injectable()
export class LessonRepository {
  constructor(private readonly prisma: PrismaService) {}

  async validateLesson(data: LessonInput): Promise<void> {
    if (!data.name) {
      throw new Error("Lesson name is required");
    }
    if (!data.folderId) {
      throw new Error("Folder ID is required");
    }
    // Add additional validation logic as necessary
  }

  async validateFolder(folderId: string): Promise<void> {
    const folder = await this.prisma.folder.findUnique({ where: { id: folderId } });
    if (!folder) {
      throw new NotFoundException(`Folder with ID ${folderId} not found`);
    }
  }

  async createLesson(data: LessonInput): Promise<any> {
    return this.prisma.lesson.create({
      data: {
        name: data.name,
        description: data.description,
        types: data.types,
        folderId: data.folderId,
      },
    });
  }

  async createLessonBlock(data: any, lessonId: string): Promise<any> {
    return this.prisma.lessonBlock.create({
      data: {
        ...data,
        lessonId,
      },
    });
  }

  async createLessonTask(data: any, lessonId: string): Promise<any> {
    return this.prisma.lessonTask.create({
      data: {
        ...data,
        lessonId,
      },
    });
  }

  async deleteLessonAndRelatedEntities(id: string): Promise<void> {
    await this.prisma.lessonBlock.deleteMany({ where: { lessonId: id } });
    await this.prisma.lessonTask.deleteMany({ where: { lessonId: id } });
    await this.prisma.lesson.delete({ where: { id } });
  }

  async updateLesson(id: string, data: UpdateLesson): Promise<any> {
    await this.prisma.lesson.update({ where: { id }, data });
  }

  async findLessonById(lessonId: string): Promise<any> {
    return this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { lessonBlocks: true, lessonTasks: true },
    });
  }

  async findAllLessons(folderId: string): Promise<any> {
    return this.prisma.lesson.findMany({
      where: { folderId },
      include: { lessonBlocks: true, lessonTasks: true },
    });
  }
}
