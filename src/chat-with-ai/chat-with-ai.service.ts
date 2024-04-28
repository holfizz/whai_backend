import { FileService } from "@/file/file.service";
import { PaginationService } from "@/pagination/pagination.service";
import { PrismaService } from "@/prisma.service";
import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { MessageWithAIRole } from "@prisma/client";
import { randomUUID } from "crypto";
import { PubSub } from "graphql-subscriptions";
import { throwError } from "rxjs";
import { catchError, tap } from "rxjs/operators";
import { ChatWithAiRequestInput } from "./dto/ChatWithAiRequestInput";
import { CreateChatWithAIInput, GetAllMessagesInput } from "./dto/messages.input";
import { DocumentReader } from "./entities/document_reader.entity";
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

  async deleteContext() {
    try {
      // this.chatHistory.deleteContext();
      // return this.chatHistory;
    } catch (error) {
      throw new Error(`Error deleting chat context: ${error.message}`);
    }
  }

  async getAIModelAnswer(userId: string, dto: ChatWithAiRequestInput, pubSub: PubSub): Promise<any> {
    const chatWithAI = await this.prisma.chatWithAI.findUnique({
      where: { id: dto.chatWithAIId },
    });
    const messagesHistory = await this.prisma.messageWithAI.findMany({
      where: { chatWithAIId: dto.chatWithAIId },
      orderBy: {
        createdAt: "asc",
      },
    });
    return new Promise((resolve, reject) => {
      let dataBuffer = "";
      let messages = [];
      return this.httpService
        .post(
          `${process.env.AI_API_URL}`,
          {
            conversation_id: chatWithAI.id,
            bot_id: process.env.CHATGPT_ID,
            user: userId,
            query: dto.content,
            content_type: "answer",
            stream: true,
            chat_history: messagesHistory,
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.CHATGPT_AI_KEY}`,
              "Content-Type": "application/json",
              Accept: "text/markdown",
              Host: "api.coze.com",
              Connection: "keep-alive",
            },
            responseType: "stream",
          },
        )
        .pipe(
          tap(response => {
            response.data.on("data", chunk => {
              dataBuffer += chunk.toString();

              let boundaryIndex;
              while ((boundaryIndex = dataBuffer.indexOf("\n\n")) !== -1) {
                const completeMessage = dataBuffer.substring(0, boundaryIndex);
                dataBuffer = dataBuffer.substring(boundaryIndex + 2);

                const eventData = completeMessage.replace(/^data:/, "").trim();
                try {
                  const parsedData = JSON.parse(eventData);
                  console.log(parsedData);
                  const messageData = { id: randomUUID(), event: parsedData.event, message: parsedData.message, conversation_id: chatWithAI.id, is_finish: parsedData.is_finish };
                  messages.push(messageData);
                  pubSub.publish("chatWithAIAnswer", {
                    chatWithAIAnswer: messageData,
                  });
                } catch (error) {
                  console.error("Error parsing JSON:", error);
                }
              }
            });

            response.data.on("end", async () => {
              const filteredMessages = messages.filter(m => m.message && m.message.type === "answer");

              if (filteredMessages.length > 0) {
                const fullContent = filteredMessages.map(m => m.message.content).join("");
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
                  resolve(messageWithAI);
                  return messageWithAI;
                } catch (prismaError) {
                  reject(prismaError);
                }
              } else {
                resolve([]);
              }
            });

            response.data.on("error", error => {
              console.error("Error with the stream:", error);
              reject(error);
            });
          }),
          catchError(error => throwError(() => new Error(`HTTP error: ${error}`))),
        )
        .subscribe();
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
}
