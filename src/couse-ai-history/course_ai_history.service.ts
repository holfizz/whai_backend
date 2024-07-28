import { PrismaService } from "@/prisma.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export default class CourseAIHistoryService {
  constructor(private readonly prisma: PrismaService) {}

  async createCourseAIHistory(userId: string, courseId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error(`User with ID ${userId} not found.`);
      }

      const course = await this.prisma.course.findUnique({
        where: { id: courseId },
      });

      if (!course) {
        throw new Error(`Course with ID $courseId} not found.`);
      }

      const existingHistory = await this.prisma.courseAIHistory.findFirst({
        where: { courseId: courseId },
      });

      if (existingHistory) {
        throw new Error(`Course with ID ${courseId} already has a chat history.`);
      }
      return await this.prisma.$transaction(async prisma => {
        const courseAIHistory = await prisma.courseAIHistory.create({
          data: {
            courseId,
          },
        });

        await prisma.course.update({
          where: { id: course.id },
          include: {
            courseAIHistory: true,
          },
          data: {
            courseAIHistory: {
              connect: {
                courseId: course.id,
              },
            },
          },
        });

        return courseAIHistory;
      });
    } catch (error) {
      throw new Error(`Error creating chat: ${error.message}`);
    }
  }

  async getCourseAIHistoryByCourseId(userId: string, courseId: string) {
    try {
      const course = await this.prisma.course.findUnique({ where: { id: courseId } });
      if (!course) {
        throw new Error(`Course with ID ${courseId} not found.`);
      }
      const courseAIHistory = await this.prisma.courseAIHistory.findFirst({ where: { courseId: courseId } });
      if (!courseAIHistory) {
        throw new Error(`Course AI History with ID ${courseId} not found.`);
      }
      return courseAIHistory;
    } catch (error) {
      throw new Error(`Error getting chats: ${error.message}`);
    }
  }

  async getCourseAIHistory(courseAIHistoryID: string) {
    try {
      const getChat = await this.prisma.courseAIHistory.findUnique({
        where: { id: courseAIHistoryID },
      });
      if (!getChat) {
        throw new Error(`Chat with AI with  ID ${getChat.id} not found.`);
      }
      return getChat;
    } catch (error) {
      throw new Error(`Error getting chat: ${error.message}`);
    }
  }
}
