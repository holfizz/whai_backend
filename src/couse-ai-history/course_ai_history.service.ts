import { PrismaService } from "@/prisma.service";
import { Injectable } from "@nestjs/common";
import { CourseAIHistoryInput } from "./dto/course_ai_history.Input";

@Injectable()
export default class CourseAIHistoryService {
  constructor(private readonly prisma: PrismaService) {}

  async createCourseAIHistory(userId: string, dto: CourseAIHistoryInput) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error(`User with ID ${userId} not found.`);
      }

      const course = await this.prisma.course.findUnique({
        where: { id: dto.courseId },
      });

      if (!course) {
        throw new Error(`Course with ID ${dto.courseId} not found.`);
      }

      const existingHistory = await this.prisma.courseAIHistory.findFirst({
        where: { courseId: dto.courseId },
      });

      if (existingHistory) {
        throw new Error(`Course with ID ${dto.courseId} already has a chat history.`);
      }
      return await this.prisma.$transaction(async prisma => {
        const courseAIHistory = await prisma.courseAIHistory.create({
          data: {
            ...dto,
            courseId: dto.courseId,
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

  async getAllCourseAIHistory(userId: string, dto: CourseAIHistoryInput) {
    try {
      const course = await this.prisma.course.findUnique({ where: { id: dto.courseId } });
      if (!course) {
        throw new Error(`Course with ID ${dto.courseId} not found.`);
      }

      // Get chats with the specified lessonId
      const chatsWithLessonId = await this.prisma.courseAIHistory.findMany({
        where: {
          userId,
          courseId: dto.courseId,
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      // Get chats without the specified lessonId
      const otherChats = await this.prisma.courseAIHistory.findMany({
        where: {
          userId,
          courseId: dto.courseId,
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      // Combine the results, with chats with lessonId first
      const sortedChats = [...chatsWithLessonId, ...otherChats];

      return sortedChats;
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
