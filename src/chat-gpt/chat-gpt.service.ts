import { Injectable } from '@nestjs/common';
import { ChatHistoryManager } from '@/chat-gpt/entities/chat-history-manager.entity';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import * as process from 'process';
import {
  ChatGptAnswerDto,
  ChatGptRequestDto,
} from '@/chat-gpt/dto/chat-gpt.dto';
import { PrismaService } from '@/prisma.service';

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

  async getAiModelAnswer(data: ChatGptRequestDto) {
    try {
      this.chatHistory.addHumanMessage(data.message);
      const result = await this.chat.invoke(this.chatHistory.chatHistory);
      const aiMessage = result.content as string;
      this.chatHistory.addAiMessage(aiMessage);
      return ChatGptAnswerDto.getInstance(aiMessage);
    } catch (error) {
      throw new Error(`Error getting AI model answer: ${error.message}`);
    }
  }

  async deleteContext() {
    try {
      await this.chatHistory.deleteContext();
      return this.chatHistory;
    } catch (error) {
      throw new Error(`Error deleting chat context: ${error.message}`);
    }
  }

  async createChat(userId: number) {
    try {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw new Error(`User with ID ${userId} not found`);
      }

      const chat = await this.prisma.chats.create({
        data: {
          userId: user.id,
        },
      });
      return chat;
    } catch (error) {
      throw new Error(`Error creating chat: ${error.message}`);
    }
  }

  async getUserChats(userId: number) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { chats: true },
      });
      if (!user) {
        throw new Error(`User with ID ${userId} not found`);
      }

      return user.chats;
    } catch (error) {
      throw new Error(`Error fetching user chats: ${error.message}`);
    }
  }
}
