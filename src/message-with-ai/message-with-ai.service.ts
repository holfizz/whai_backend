import { EduAiService } from "@/edu-ai/edu-ai.service";
import { PaginationService } from "@/pagination/pagination.service";
import { PrismaService } from "@/prisma.service";
import { Injectable } from "@nestjs/common";
import { MessageWithAIRole } from "@prisma/client";
import { PubSub } from "graphql-subscriptions";
import { GenerateTDInput, GetAllMessagesInput, MessageWithAIInput } from "./dto/message-with-ai.input";
import { UpdateMessageWithAiInput } from "./dto/update-message-with-ai.input";
import { AIDTO } from "@/edu-ai/types/ai.types";

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

    try {
      const fullContent = await this.eduAiService.getAIModelAnswer(
        chatWithAI.id,
        userId,
        {
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

  async findOne(id: number) {
    return `This action returns a #${id} messageWithAi`;
  }

  async update(id: number, updateMessageWithAiInput: UpdateMessageWithAiInput) {
    return `This action updates a #${id} messageWithAi`;
  }

  async remove(id: number) {
    return `This action removes a #${id} messageWithAi`;
  }

  async generateTitleAndDescription(dto: GenerateTDInput, userId: string) {
    const aiDto: AIDTO = {
      content: {
        createType: "Заголовок",
        descriptionType: "Создай заголовки и описания",
        userRequest: dto.userRequest,
      },
    };
    const fullContent = await this.eduAiService.getAIModelAnswer(dto.conversationId, userId, aiDto, "EduAI");
    if (!fullContent) throw new Error("Failed to get content from AI service.");
    const tdJson = this.extractTDJson(fullContent);

    const parsedContent = JSON.parse(tdJson);
    console.log("parsedContent", parsedContent);

    return parsedContent;
  }

  private extractTDJson(content: string): string {
    const patterns = [/```td\n```json\n([\s\S]*?)\n```\n```/, /```json\n```td\n([\s\S]*?)\n```\n```/, /```td\n([\s\S]*?)\n```/, /```json\n([\s\S]*?)\n```/];
    let match = null;
    for (const pattern of patterns) {
      match = content.match(pattern);
      if (match && match.length >= 2) {
        break;
      }
    }
    if (!match || match.length < 2) {
      throw new Error("Cannot find TD JSON in the provided content.");
    }
    let tdJson = match[1];
    console.log(tdJson);
    if (tdJson.trim().startsWith("json")) {
      tdJson = tdJson.replace(/^json\s*/, "");
    }
    console.log(tdJson);
    try {
      JSON.parse(tdJson);
    } catch (e) {
      throw new Error("Extracted content is not valid JSON.");
    }

    return tdJson;
  }
}
