import { PrismaService } from "@/prisma.service";
import { Injectable, NotFoundException } from "@nestjs/common";
import { TopicInput } from "./dto/create-topic.input";
import { UpdateTopicInput } from "./dto/update-topic.input";

@Injectable()
export class TopicService {
  constructor(private readonly prisma: PrismaService) {}

  async createTopic(createTopicInput: TopicInput) {
    return this.prisma.topic.create({
      data: createTopicInput,
    });
  }

  async updateTopic(id: string, updateTopicInput: UpdateTopicInput) {
    let existingTopic = await this.prisma.topic.findUnique({ where: { id } });

    if (!existingTopic) {
      throw new NotFoundException(`Topic with ID ${id} not found.`);
    }

    return this.prisma.topic.update({
      where: { id },
      data: {
        ...updateTopicInput,
      },
    });
  }

  async deleteTopic(id: string) {
    let existingTopic = await this.prisma.topic.findUnique({ where: { id } });

    if (!existingTopic) {
      throw new NotFoundException(`Topic with ID ${id} not found.`);
    }

    return this.prisma.topic.delete({ where: { id } });
  }

  async getTopic(topicId: string) {
    const subtopics = await this.prisma.subtopic.findMany({
      where: { topicId },
    });

    const subtopicIds = subtopics.map(subtopic => subtopic.id);
    const lessons = await this.prisma.lesson.findMany({
      where: { subtopicId: { in: subtopicIds } },
    });

    const quizzes = await this.prisma.quiz.findMany({
      where: { subtopicId: { in: subtopicIds } },
    });

    const completedLessons = lessons.filter(lesson => lesson.isCompleted).length;
    const completedQuizzes = quizzes.filter(quiz => quiz.isCompleted).length;

    const totalItems = lessons.length + quizzes.length;
    const completedItems = completedLessons + completedQuizzes;
    const totalPercent = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

    // Обновляем процент прохождения топика
    return this.prisma.topic.update({
      where: { id: topicId },
      data: {
        progressPercents: totalPercent,
      },
    });
  }
}
