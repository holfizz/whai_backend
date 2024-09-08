import { PrismaService } from "@/prisma.service";
import { Injectable } from "@nestjs/common";
import { ChatWithAIInput } from "./dto/chat-with-ai.input";

@Injectable()
export default class ChatWithAIService {
  constructor(private readonly prisma: PrismaService) {}

  async createChatWithAI(userId: string, dto: ChatWithAIInput) {
    try {
      const lesson = await this.prisma.lesson.findUnique({
        where: { id: dto.lessonId },
      });
      if (!lesson) {
        throw new Error(`Lesson with ID ${dto.lessonId} not found.`);
      }
      return await this.prisma.chatWithAI.create({
        data: {
          ...dto,
          lessonId: dto.lessonId,
          userId,
        },
      });
    } catch (error) {
      throw new Error(`Error creating chat: ${error.message}`);
    }
  }

  async getAllChatsWithAI(userId: string, lessonId: string) {
    try {
      const chatsWithLessonId = await this.prisma.chatWithAI.findMany({
        where: {
          userId,
          lessonId,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      // Get chats without the specified lessonId
      const otherChats = await this.prisma.chatWithAI.findMany({
        where: {
          userId,
          lessonId: {
            not: lessonId,
          },
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

  async getChatWithAI(userId: string, chatWithAIID: string) {
    try {
      const getChat = await this.prisma.chatWithAI.findUnique({
        where: { userId, id: chatWithAIID },
      });
      if (!getChat) {
        throw new Error(`Chat with AI with ID ${chatWithAIID} not found.`);
      }
      return getChat;
    } catch (error) {
      throw new Error(`Error getting chat: ${error.message}`);
    }
  }
}
