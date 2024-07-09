import { PrismaService } from "@/prisma.service";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { SubtopicInput } from "./dto/create-subtopic.input";
import { UpdateSubtopicInput } from "./dto/update-subtopic.input";

@Injectable()
export class SubtopicService {
  constructor(private readonly prisma: PrismaService) {}

  async createSubtopic(data: SubtopicInput) {
    if (!data.topicId) {
      throw new BadRequestException("topicId must be provided888");
    }

    console.log("Creating subtopic for topicId:", data.topicId);
    const topic = await this.prisma.topic.findUnique({ where: { id: data.topicId } });
    if (!topic) {
      console.error(`Topic with ID ${data.topicId} not found`);
      throw new NotFoundException(`Topic with ID ${data.topicId} not found`);
    }
    const subtopic = await this.prisma.subtopic.create({
      data,
    });
    return {
      ...subtopic,
      ...(await this.getSubtopicStats(subtopic.id)),
    };
  }

  async getSubtopic(subtopicId: string) {
    const subtopic = await this.prisma.subtopic.findUnique({ where: { id: subtopicId } });
    if (!subtopic) {
      throw new NotFoundException(`Subtopic with ID ${subtopicId} not found`);
    }
    return {
      ...subtopic,
      ...(await this.getSubtopicStats(subtopicId)),
    };
  }

  async getAllSubtopics(topicId: string) {
    const subtopics = await this.prisma.subtopic.findMany({ where: { topicId } });

    return await Promise.all(
      subtopics.map(async subtopic => {
        return { ...subtopic, ...(await this.getSubtopicStats(subtopic.id)) };
      }),
    );
  }

  async updateSubtopic(id: string, updateSubtopicInput: UpdateSubtopicInput) {
    let existingSubtopic = await this.prisma.subtopic.findUnique({ where: { id } });

    if (!existingSubtopic) {
      throw new NotFoundException(`Subtopic with ID ${id} not found.`);
    }

    return this.prisma.subtopic.update({
      where: { id },
      data: {
        ...updateSubtopicInput,
      },
    });
  }

  async deleteSubtopic(id: string) {
    let existingSubtopic = await this.prisma.subtopic.findUnique({ where: { id } });

    if (!existingSubtopic) {
      throw new NotFoundException(`Subtopic with ID ${id} not found.`);
    }

    return this.prisma.subtopic.delete({ where: { id } });
  }

  async getSubtopicStats(subtopicId: string) {
    const lessons = await this.prisma.lesson.findMany({
      where: { subtopicId },
    });

    const quizzes = await this.prisma.quiz.findMany({
      where: { subtopicId },
    });

    const completedLessons = lessons.filter(lesson => lesson.isCompleted).length;
    const completedQuizzes = quizzes.filter(quiz => quiz.isCompleted).length;

    const totalItems = lessons.length + quizzes.length;
    const completedItems = completedLessons + completedQuizzes;
    const totalPercent = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

    // Calculate total completion time
    const totalLessonsTime = lessons.reduce((sum, lesson) => sum + (lesson.completionTime || 0), 0);
    const totalQuizzesTime = quizzes.reduce((sum, quiz) => sum + (quiz.completionTime || 0), 0);
    const totalTime = totalLessonsTime + totalQuizzesTime;

    // Round total time to the nearest whole hour
    const roundedTotalTime = Math.round(totalTime / 60);

    return {
      progressPercents: totalPercent || 0,
      completionTime: roundedTotalTime || 0,
    };
  }
}
