import { FileService } from "@/file/file.service";
import { PaginationService } from "@/pagination/pagination.service";
import { PrismaService } from "@/prisma.service";
import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { AxiosResponse } from "axios";
import { PubSub } from "graphql-subscriptions";
import { ChatWithAiRequestInput, CreateChatWithAIInput, GetAllMessagesInput } from "./dto/messages.input";
import { DocumentReader } from "./entities/document_reader.entity";
const pubSub = new PubSub();
@Injectable()
export default class ChatWithAIService {
  private readonly documentReader: DocumentReader;

  constructor(
    private readonly prisma: PrismaService,
    private readonly fileService: FileService,
    private readonly paginationService: PaginationService,
    private readonly httpService: HttpService,
  ) {
    this.documentReader = new DocumentReader();
  }
  // private async fileToText(dto: ChatWithAiRequestInput, file): Promise<{ text: () => string; fileData: string; filePath: string }> {
  // let filePath: string = "";
  // let fileData = "";
  // if (file) {
  //   filePath = this.fileService.createFile(FileType.DOCUMENT, file);
  //   fileData = await this.documentReader.readDocumentFile(filePath);
  // }
  // const text = () => {
  //   if (fileData) {
  //     return dto.text + "" + `{fileData: ${fileData} }`;
  //   } else {
  //     return dto.text;
  //   }
  // };
  // return { text, fileData, filePath };
  // }
  async createChatWithAI(userId: string, dto: CreateChatWithAIInput) {
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
  async getAllChatsWithAi(userId: string) {
    try {
      const createChat = await this.prisma.chatWithAI.findMany({
        where: { userId },
      });
      return createChat;
    } catch (error) {
      throw new Error(`Error creating chat: ${error.message}`);
    }
  }
  async saveUserAIMessage(dto: ChatWithAiRequestInput, file, userId: string) {}
  async createMessageWithAI(dto: ChatWithAiRequestInput, userId: string) {
    try {
      // const { fileData } = await this.fileToText(dto, file);

      const aiResponse = await this.getAiModelAnswer(userId, dto);
      pubSub.publish("aiMessageResponse", {
        aiMessageResponse: aiResponse,
      });
    } catch (error) {
      throw new Error(`Error creating chat: ${error.message}`);
    }
  }
  async deleteContext() {
    try {
      // this.chatHistory.deleteContext();
      // return this.chatHistory;
    } catch (error) {
      throw new Error(`Error deleting chat context: ${error.message}`);
    }
  }

  async getAiModelAnswer(userId: string, dto: ChatWithAiRequestInput): Promise<AxiosResponse<any>> {
    try {
      const response = this.httpService.post(
        process.env.AI_API_URL,
        {
          conversation_id: dto.chatWithAIId,
          bot_id: process.env.CHATGPT_ID,
          user: userId,
          query: dto.content,
          stream: true,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.CHATGPT_AI_KEY}`,
            "Content-Type": "application/json",
            Accept: "*/*",
            Host: "api.coze.com",
            Connection: "keep-alive",
          },
        },
      ) as any;

      console.log(response.data);
      return response;
    } catch (error) {
      throw new Error(`Error getting AI model answer: ${error.message}`);
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
