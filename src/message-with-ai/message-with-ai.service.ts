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
  async getAIModelAnswer(userId: string, dto: MessageWithAIInput, pubSub: PubSub): Promise<any> {
    const chatWithAI = await this.prisma.chatWithAI.findUnique({
      where: { id: dto.chatWithAIId },
    });
    const messagesHistory = await this.prisma.messageWithAI.findMany({
      where: { chatWithAIId: dto.chatWithAIId },
      orderBy: {
        createdAt: "asc",
      },
    });
    return this.eduAiService
      .getAIModelAnswer(chatWithAI.id, userId, { messagesHistory: messagesHistory, content: dto.content }, "ChatAI", pubSub)
      .then(async fullContent => {
        if (fullContent.length > 0) {
          try {
            await this.prisma.messageWithAI.create({
              data: {
                chatWithAIId: chatWithAI.id,
                content: dto.content,
                role: MessageWithAIRole.USER,
              },
            });
            const messageWithAI = await this.prisma.messageWithAI.create({
              data: {
                content: fullContent,
                chatWithAIId: chatWithAI.id,
                role: MessageWithAIRole.ASSISTANT,
              },
            });
            console.log(messageWithAI);
            return messageWithAI;
          } catch (prismaError) {
            throw prismaError;
          }
        } else {
          return [];
        }
      })
      .catch(error => {
        console.error("Error: ", error);
        throw error;
      });
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
