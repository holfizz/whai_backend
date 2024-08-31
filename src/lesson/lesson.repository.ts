import { PrismaService } from "@/prisma.service";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { LessonInput } from "./dto/lesson.input";
import { UpdateLesson } from "./dto/update-lesson.input";

@Injectable()
export class LessonRepository {
  constructor(private readonly prisma: PrismaService) {}

  async validateLesson(data: LessonInput): Promise<void> {
    if (!data.name) {
      throw new Error("Lesson name is required");
    }
    if (!data.subtopicId) {
      throw new Error("Subtopic ID is required");
    }
  }

  async validateSubtopic(subtopicId: string): Promise<void> {
    const subtopic = await this.prisma.subtopic.findUnique({ where: { id: subtopicId } });
    if (!subtopic) {
      throw new NotFoundException(`Subtopic with ID ${subtopicId} not found`);
    }
  }

  async createLesson(data: LessonInput): Promise<any> {
    if (!data.courseId) {
      throw new BadRequestException("courseId must be provided");
    }
    const course = await this.prisma.course.findUnique({ where: { id: data.courseId } });
    if (!course) {
      throw new BadRequestException(`Course with ID ${data.courseId} not exist`);
    }

    return this.prisma.lesson.create({
      data: {
        name: data.name,
        description: data.description,
        types: course.isHasVideo ? ["VIDEO"] : [],
        subtopicId: data.subtopicId,
        courseId: data.courseId,
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

  async updateLesson(data: UpdateLesson): Promise<any> {
    return this.prisma.lesson.update({
      where: { id: data.id },
      data,
    });
  }

  async findLessonById(lessonId: string): Promise<any> {
    return this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        lessonBlocks: {
          orderBy: {
            createdAt: "asc",
          },
        },
        lessonTasks: true,
      },
    });
  }

  async findAllLessons(subtopicId: string): Promise<any> {
    return this.prisma.lesson.findMany({
      where: { subtopicId },
      orderBy: {
        createdAt: "asc",
      },
      include: { lessonBlocks: true, lessonTasks: true },
    });
  }
}
