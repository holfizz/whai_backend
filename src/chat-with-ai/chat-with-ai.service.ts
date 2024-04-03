import { ChatHistoryManager } from "@/chat-with-ai/entities/chat-history-manager.entity";
import { FileService, FileType } from "@/file/file.service";
import { PaginationService } from "@/pagination/pagination.service";
import { PrismaService } from "@/prisma.service";
import { Injectable } from "@nestjs/common";
import { MessageWithAIFrom } from "@prisma/client";
import { ChatOpenAI } from "langchain/chat_models/openai";
import * as process from "process";
import { ChatWithAiRequestInput, CreateChatWithAIInput, GetAllMessagesInput } from "./dto/messages.input";
import { DocumentReader } from "./entities/document_reader.entity";

const DEFAULT_TEMPERATURE = 1.6;
const DEFAULT_MODEL = "gpt-3.5-turbo";

@Injectable()
export default class ChatWithAIService {
  private readonly chatHistory: ChatHistoryManager;
  private readonly documentReader: DocumentReader;
  private readonly chat: ChatOpenAI;

  constructor(
    private readonly prisma: PrismaService,
    private readonly fileService: FileService,
    private readonly paginationService: PaginationService,
  ) {
    this.chatHistory = new ChatHistoryManager();
    this.chat = new ChatOpenAI({
      temperature: DEFAULT_TEMPERATURE,
      openAIApiKey: process.env.OPENAI_KEY, // Use your OpenAI Key here
      modelName: DEFAULT_MODEL,
      maxTokens: 1000,
      maxRetries: 5,
      streaming: true,
    });
    this.documentReader = new DocumentReader();
  }
  private async fileToText(dto: ChatWithAiRequestInput, file): Promise<{ text: () => string; fileData: string; filePath: string }> {
    let filePath: string = "";
    let fileData = "";

    if (file) {
      filePath = this.fileService.createFile(FileType.DOCUMENT, file);
      fileData = await this.documentReader.readDocumentFile(filePath);
    }
    const text = () => {
      if (fileData) {
        return dto.text + "" + `{fileData: ${fileData} }`;
      } else {
        return dto.text;
      }
    };
    return { text, fileData, filePath };
  }
  async createChatWithAI(userId: number, dto: CreateChatWithAIInput) {
    try {
      const createChat = await this.prisma.chatWithAI.create({
        data: {
          ...dto,
          userId,
        },
      });
      return createChat;
    } catch (error) {
      throw new Error(`Error creating chat: ${error.message}`);
    }
  }
  async getAllChatsWithAi(userId: number) {
    try {
      const createChat = await this.prisma.chatWithAI.findMany({
        where: { userId },
      });
      return createChat;
    } catch (error) {
      throw new Error(`Error creating chat: ${error.message}`);
    }
  }
  async saveUserAIMessage(dto: ChatWithAiRequestInput, file, userId: number) {
    const { text } = await this.fileToText(dto, file);
    const chat = await this.prisma.chatWithAI.findFirst({
      where: {
        id: dto.chatWithAIId,
        userId: userId,
      },
    });

    if (!chat) {
      throw new Error("Chat not found or does not belong to the user");
    }

    return await this.prisma.messageWithAI.create({
      data: {
        ...dto,
        text: text(),
        chatWithAIId: +dto.chatWithAIId,
      },
    });
  }
  async createMessageWithAI(dto: ChatWithAiRequestInput, file) {
    try {
      const { fileData } = await this.fileToText(dto, file);

      return await this.getAiModelAnswer(dto, fileData);
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

  async getAiModelAnswer(dto: ChatWithAiRequestInput, fileData?: string) {
    try {
      const chatHistory = new ChatHistoryManager();
      const getAllMessages = await this.prisma.messageWithAI.findMany({
        where: { chatWithAIId: +dto.chatWithAIId },
      });

      getAllMessages.forEach(message => {
        if (message.from === MessageWithAIFrom.USER) {
          chatHistory.addHumanMessage(message.text, !!fileData && fileData);
        } else if (message.from === MessageWithAIFrom.AI) {
          chatHistory.addAiMessage(message.text);
        }
      });

      const result = await this.chat.invoke(chatHistory.getChatMessages(), {
        callbacks: [
          {
            handleLLMNewToken(token: string) {
              return token;
            },
          },
        ],
      });

      const aiMessage = String(result.content);
      chatHistory.addAiMessage(aiMessage);

      const data = {
        text: aiMessage,
        from: MessageWithAIFrom.AI,
        chatWithAIId: dto.chatWithAIId,
      };

      const aiAnswer = await this.prisma.messageWithAI.create({
        data,
      });

      return aiAnswer;
    } catch (error) {
      throw new Error(`Error getting AI model answer: ${error.message}`);
    }
  }

  async getAllMessagesInChatWithAI(userId: number, dto: GetAllMessagesInput) {
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
}
