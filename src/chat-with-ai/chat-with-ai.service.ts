import { ChatHistoryManager } from '@/chat-with-ai/entities/chat-history-manager.entity';
import { PrismaService } from '@/prisma.service';
import { Injectable } from '@nestjs/common';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import * as process from 'process';
import {
  chatWithAiAnswerDto,
  chatWithAiRequestDto,
  createChatWithAI,
} from './dto/chat-with-ai.dto';

const DEFAULT_TEMPERATURE = 1;
const DEFAULT_MODEL = 'gpt-3.5-turbo';

@Injectable()
export class ChatGptService {
  private readonly chatHistory: ChatHistoryManager;
  private readonly chat: ChatOpenAI;

  constructor(private readonly prisma: PrismaService) {
    this.chatHistory = new ChatHistoryManager();
    this.chat = new ChatOpenAI({
      temperature: DEFAULT_TEMPERATURE,
      openAIApiKey: process.env.OPENAI_KEY,
      modelName: DEFAULT_MODEL,
    });
  }

  async createChatWithAI(userId: number, dto: createChatWithAI) {
    try {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw new Error(`User with ID ${userId} not found`);
      }

      const chat = await this.prisma.chatWithAI.create({
        data: {
          ...dto,
          userId: user.id,
        },
      });
      return chat;
    } catch (error) {
      throw new Error(`Error creating chat: ${error.message}`);
    }
  }
  async createMessageWithAI(userId: number, dto: chatWithAiRequestDto) {
    try {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw new Error(`User with ID ${userId} not found`);
      }

      const chat = await this.prisma.messageWIthAI.create({
        data: dto,
      });
      return chat;
    } catch (error) {
      throw new Error(`Error creating chat: ${error.message}`);
    }
  }
  async deleteContext() {
    try {
      this.chatHistory.deleteContext();
      return this.chatHistory;
    } catch (error) {
      throw new Error(`Error deleting chat context: ${error.message}`);
    }
  }

  // async createChat(userId: number) {
  //   try {
  //     const user = await this.prisma.user.findUnique({ where: { id: userId } });
  //     if (!user) {
  //       throw new Error(`User with ID ${userId} not found`);
  //     }

  //     const chat = await this.prisma.chats.create({
  //       data: {
  //         userId: user.id,
  //       },
  //     });
  //     return chat;
  //   } catch (error) {
  //     throw new Error(`Error creating chat: ${error.message}`);
  //   }
  // }

  private async getAiModelAnswer(data: chatWithAiAnswerDto) {
    try {
      this.chatHistory.addHumanMessage(data.aiMessage);
      const result = await this.chat.invoke(this.chatHistory.chatHistory);
      const aiMessage = result.content as string;
      this.chatHistory.addAiMessage(aiMessage);
      return this.chatHistory.chatHistory;
    } catch (error) {
      throw new Error(`Error getting AI model answer: ${error.message}`);
    }
  }
  // async createMessage(userId: number, message) {
  //   try {
  //     const user = await this.prisma.user.findUnique({ where: { id: userId } });
  //     if (!user) {
  //       throw new Error(`User with ID ${userId} not found`);
  //     }

  //     const chat = await this.prisma.chats.create({
  //       data: {
  //         userId: user.id,
  //       },
  //     });
  //     return chat;
  //   } catch (error) {
  //     throw new Error(`Error creating chat: ${error.message}`);
  //   }
  // }
  // async getAllMessages(id: number) {
  //   try {
  //     const messages = await this.prisma.chats.findUnique({
  //       where: { id },
  //       include: { messages: true },
  //     });
  //     return messages;
  //   } catch (error) {
  //     throw new Error(`Error creating chat: ${error.message}`);
  //   }
  // }
  // async getAllMessage() {
  //   return this.chatHistory.chatHistory;
  // }

  // async getUserChats(userId: number) {
  //   try {
  //     const user = await this.prisma.user.findUnique({
  //       where: { id: userId },
  //       include: { chats: true },
  //     });
  //     if (!user) {
  //       throw new Error(`User with ID ${userId} not found`);
  //     }

  //     return user.chats;
  //   } catch (error) {
  //     throw new Error(`Error fetching user chats: ${error.message}`);
  //   }
  // }
}
