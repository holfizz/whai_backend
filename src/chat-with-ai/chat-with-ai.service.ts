import { ChatHistoryManager } from '@/chat-with-ai/entities/chat-history-manager.entity';
import { PrismaService } from '@/prisma.service';
import { Injectable } from '@nestjs/common';
import { MessageWIthAIFrom } from '@prisma/client';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import * as process from 'process';
import { chatWithAiRequestDto, createChatWithAI } from './dto/chat-with-ai.dto';

const DEFAULT_TEMPERATURE = 1;
const DEFAULT_MODEL = 'gpt-3.5-turbo';

@Injectable()
export default class ChatGptService {
  private readonly chatHistory: ChatHistoryManager;
  private readonly chat: ChatOpenAI;

  constructor(private readonly prisma: PrismaService) {
    this.chatHistory = new ChatHistoryManager();
    this.chat = new ChatOpenAI({
      temperature: DEFAULT_TEMPERATURE,
      openAIApiKey: process.env.OPENAI_KEY, // Use your OpenAI Key here
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
      await this.prisma.messageWIthAI.create({
        data: dto,
      });
      return this.getAiModelAnswer(userId, dto);
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

  async getAiModelAnswer(userId: number, dto: chatWithAiRequestDto) {
    try {
      const chatHistory = new ChatHistoryManager();
      const getAllMessages = await this.prisma.messageWIthAI.findMany({
        where: { chatWithAIId: dto.chatWithAIId },
      });
      getAllMessages.forEach((message) => {
        if (message.from === MessageWIthAIFrom.USER) {
          chatHistory.addHumanMessage(message.text);
        } else if (message.from === MessageWIthAIFrom.AI) {
          chatHistory.addAiMessage(message.text);
        }
      });

      const result = await this.chat.invoke(chatHistory.getChatMessages());
      const aiMessage = result.content as string;
      chatHistory.addAiMessage(aiMessage);

      const data = {
        text: aiMessage,
        from: MessageWIthAIFrom.AI,
        chatWithAIId: dto.chatWithAIId,
      };

      await this.prisma.messageWIthAI.create({
        data,
      });

      return chatHistory.getChatMessages();
    } catch (error) {
      throw new Error(`Error getting AI model answer: ${error.message}`);
    }
  }

  async getAllMessageInChatWithAI(chatId: number) {
    try {
      const chat = await this.prisma.chatWithAI.findUnique({
        where: { id: chatId },
        include: { messages: true },
      });
      if (!chat) {
        throw new Error(`Chat with ID ${chat} not found`);
      }
      return chat.messages;
    } catch (error) {
      throw new Error(`Error fetching user chats: ${error.message}`);
    }
  }
}
