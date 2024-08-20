import { EduAiService } from "@/edu-ai/edu-ai.service";
import logger from "@/helpers/logger";
import { LessonBlock } from "@/lesson-block/entities/lesson-block.entity";
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
  private collectLessonContent(lessonBlocks: LessonBlock[]): string {
    let content = "";

    for (const block of lessonBlocks) {
      if (block.type === "TEXT") {
        content += block.text + "\n\n";
      } else if (block.videoUrl) {
        content += `Video URL: ${block.videoUrl}\n\n`;
      } else if (block.imageUrl) {
        content += `Image URL: ${block.imageUrl}\n\n`;
      } else if (block.code) {
        content += `Code:\n${block.code}\n\n`;
      }
    }

    return content.trim();
  }
  async getChatAIMAnswers(userId: string, dto: MessageWithAIInput, pubSub: PubSub): Promise<any> {
    const chatWithAI = await this.prisma.chatWithAI.findUnique({
      where: { id: dto.chatWithAIId },
    });
    if (!chatWithAI) {
      throw new Error(`Chat with AI with ID ${dto.chatWithAIId} not found`);
    }
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: dto.lessonId },
      include: {
        lessonBlocks: true,
      },
    });
    if (!lesson) {
      throw new Error(`Lesson with ID ${dto.lessonId} not found`);
    }
    const lessonData = this.collectLessonContent(lesson.lessonBlocks);
    try {
      const fullContent = await this.eduAiService.getAIModelAnswer(
        chatWithAI.id,
        userId,
        {
          content: {
            createType: "Ответ",
            createDescription: "Дай ответ на вопрос",
            message: dto.message,
            lessonData,
          },
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
          content: dto.message,
          role: MessageWithAIRole.USER,
        },
      });

      const assistantMessage = await this.prisma.messageWithAI.create({
        data: {
          chatWithAIId: chatWithAI.id,
          content: fullContent,
          role: MessageWithAIRole.ASSISTANT,
        },
      });

      logger.log(assistantMessage);
      return assistantMessage;
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
}
