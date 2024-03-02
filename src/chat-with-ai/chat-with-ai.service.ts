import { ChatHistoryManager } from "@/chat-with-ai/entities/chat-history-manager.entity";
import { FileService, FileType } from "@/file/file.service";
import { PrismaService } from "@/prisma.service";
import { Injectable } from "@nestjs/common";
import { MessageWIthAIFrom } from "@prisma/client";
import { ChatOpenAI } from "langchain/chat_models/openai";
import * as process from "process";
import { ChatWithAiRequestInput, CreateChatWithAIInput } from "./dto/create-chat-with-ai.input";
import { DocumentReader } from "./entities/document_reader.entity";

const DEFAULT_TEMPERATURE = 1;
const DEFAULT_MODEL = "gpt-3.5-turbo";

@Injectable()
export default class ChatWithAIService {
  private readonly chatHistory: ChatHistoryManager;
  private readonly documentReader: DocumentReader;
  private readonly chat: ChatOpenAI;

  constructor(
    private readonly prisma: PrismaService,
    private readonly fileService: FileService,
  ) {
    this.chatHistory = new ChatHistoryManager();
    this.chat = new ChatOpenAI({
      temperature: DEFAULT_TEMPERATURE,
      openAIApiKey: process.env.OPENAI_KEY, // Use your OpenAI Key here
      modelName: DEFAULT_MODEL,
    });
    this.documentReader = new DocumentReader();
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
  async createMessageWithAI(userId: number, dto: ChatWithAiRequestInput, file) {
    try {
      let filePath: string = "";

      let fileData = "";
      if (file) {
        filePath = this.fileService.createFile(FileType.DOCUMENT, file);
        fileData = await this.documentReader.readDocumentFile(filePath);
      }

      const textData = (dto, fileData) => {
        if (fileData) {
          return dto.text + "" + `{fileData: ${fileData} }`;
        } else {
          return dto.text;
        }
      };
      await this.prisma.messageWIthAI.create({
        data: {
          ...dto,
          text: textData(dto, fileData),
          chatWithAIId: +dto.chatWithAIId,
        },
      });
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
      const getAllMessages = await this.prisma.messageWIthAI.findMany({
        where: { chatWithAIId: +dto.chatWithAIId },
      });

      getAllMessages.forEach(message => {
        if (message.from === MessageWIthAIFrom.USER) {
          chatHistory.addHumanMessage(message.text, !!fileData && fileData);
        } else if (message.from === MessageWIthAIFrom.AI) {
          chatHistory.addAiMessage(message.text);
        }
      });

      const result = await this.chat.invoke(chatHistory.getChatMessages());
      const aiMessage = String(result.content);
      chatHistory.addAiMessage(aiMessage);

      const data = {
        text: aiMessage,
        from: MessageWIthAIFrom.AI,
        chatWithAIId: dto.chatWithAIId,
      };

      await this.prisma.messageWIthAI.create({
        data,
      });

      return data;
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
