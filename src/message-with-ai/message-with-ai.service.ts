import { EduAiService } from "@/edu-ai/edu-ai.service";
import { PaginationService } from "@/pagination/pagination.service";
import { PrismaService } from "@/prisma.service";
import { Injectable } from "@nestjs/common";
import { MessageWithAIRole } from "@prisma/client";
import { PubSub } from "graphql-subscriptions";
import { GetAllMessagesInput, MessageWithAIInput } from "./dto/message-with-ai.input";
import { UpdateMessageWithAiInput } from "./dto/update-message-with-ai.input";

@Injectable()
export class MessageWithAiService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paginationService: PaginationService,
    private readonly eduAiService: EduAiService,
  ) {}

  async getChatAIMAnswers(userId: string, dto: MessageWithAIInput, pubSub: PubSub): Promise<any> {
    const chatWithAI = await this.prisma.chatWithAI.findUnique({
      where: { id: dto.chatWithAIId },
    });
    if (!chatWithAI) {
      throw new Error(`Chat with AI with ID ${dto.chatWithAIId} not found`);
    }

    const messagesHistory = await this.prisma.messageWithAI.findMany({
      where: { chatWithAIId: dto.chatWithAIId },
      orderBy: { createdAt: "asc" },
    });

    try {
      const fullContent = await this.eduAiService.getAIModelAnswer(
        chatWithAI.id,
        userId,
        {
          messagesHistory: messagesHistory,
          content: dto.content,
        },
        "EduAI",
        pubSub,
      );

      if (!fullContent || fullContent.length === 0) {
        throw new Error(`AI returned empty content for chatWithAI ID ${chatWithAI.id}`);
      }

      const userMessage = await this.prisma.messageWithAI.create({
        data: {
          chatWithAIId: chatWithAI.id,
          content: dto.content, // Ensure content is correctly set
          role: MessageWithAIRole.USER,
        },
      });

      const assistantMessage = await this.prisma.messageWithAI.create({
        data: {
          chatWithAIId: chatWithAI.id,
          content: fullContent, // Ensure fullContent is correctly set
          role: MessageWithAIRole.ASSISTANT,
        },
      });

      console.log(assistantMessage);
      return assistantMessage; // Assuming assistantMessage has content field correctly set
    } catch (error) {
      console.error("Error: ", error);
      throw error;
    }
  }

  async getAllMessagesInChatWithAI(userId: string, dto: GetAllMessagesInput) {
    try {
      const { take, skip } = this.paginationService.getPagination(dto);
      const chat = await this.prisma.chatWithAI.findUnique({
        where: { id: dto.chatId, userId },
        include: {
          messages: {
            take,
            skip,
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      });
      if (!chat) {
        throw new Error(`Chat with ID ${chat} not found`);
      }
      return chat.messages;
    } catch (error) {
      throw new Error(`Error fetching user chats: ${error.message}`);
    }
  }

  async getMessagesByCourseAIHistoryId(userId: string, courseAIHistoryId: string) {
    try {
      const courseAIHistory = await this.prisma.courseAIHistory.findUnique({ where: { id: courseAIHistoryId } });
      if (!courseAIHistory) {
        throw new Error(` Course AI History with ID ${courseAIHistoryId} not found`);
      }
      return this.prisma.messageWithAI.findMany({
        where: { courseAIHistoryId },
        orderBy: {
          createdAt: "desc",
        },
      });
    } catch (error) {
      throw new Error(`Error fetching messages for Course AI History: ${error.message}`);
    }
  }
  findOne(id: number) {
    return `This action returns a #${id} messageWithAi`;
  }

  update(id: number, updateMessageWithAiInput: UpdateMessageWithAiInput) {
    return `This action updates a #${id} messageWithAi`;
  }

  remove(id: number) {
    return `This action removes a #${id} messageWithAi`;
  }
}
