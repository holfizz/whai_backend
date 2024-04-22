import { FileService } from "@/file/file.service";
import { PaginationService } from "@/pagination/pagination.service";
import { PrismaService } from "@/prisma.service";
import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { randomUUID } from "crypto";
import { PubSub } from "graphql-subscriptions";
import { throwError } from "rxjs";
import { catchError, tap } from "rxjs/operators";
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

  async deleteContext() {
    try {
      // this.chatHistory.deleteContext();
      // return this.chatHistory;
    } catch (error) {
      throw new Error(`Error deleting chat context: ${error.message}`);
    }
  }
  async createMessageWithAI(userId: string, dto: ChatWithAiRequestInput) {
    try {
      return await this.getAiModelAnswer(userId, dto);
    } catch (error) {
      throw new Error(`Error creating chat: ${error.message}`);
    }
  }
  async getAiModelAnswer(userId: string, dto: ChatWithAiRequestInput): Promise<void> {
    let dataBuffer = "";
    this.httpService
      .post(
        `${process.env.AI_API_URL}`,
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
                // console.log(parsedData);

                pubSub.publish("chatWithAIAnswer", {
                  chatWithAIAnswer: {
                    id: randomUUID(),
                    event: parsedData.event,
                    message: parsedData.message,
                    conversation_id: dto.chatWithAIId,
                    is_finish: parsedData.is_finish,
                    index: parsedData.index,
                    seq_id: parsedData.seq_id,
                  },
                });
              } catch (error) {
                console.error("Error parsing JSON:", error);
              }
            }
          });

          response.data.on("end", () => {
            if (dataBuffer.length > 0) {
              try {
                const parsedData = JSON.parse(dataBuffer);
                pubSub.publish("chatWithAIAnswer", {
                  chatWithAIAnswer: {
                    id: randomUUID(),
                    event: parsedData.event,
                    message: parsedData.message,
                    conversation_id: dto.chatWithAIId,
                    is_finish: parsedData.is_finish,
                    index: parsedData.index,
                    seq_id: parsedData.seq_id,
                  },
                });
              } catch (error) {
                console.error("Error parsing JSON in the end of the stream:", error);
              }
            }
          });

          response.data.on("error", error => {
            console.error("Error with the stream:", error);
          });
        }),
        catchError(error => throwError(() => new Error(`HTTP error: ${error}`))),
      )
      .subscribe();
    pubSub.publish("chatWithAIAnswer", {
      index: 1312312312,
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
