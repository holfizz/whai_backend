import logger from "@/helpers/logger";
import { PrismaService } from "@/prisma.service";
import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { randomUUID } from "crypto";
import { PubSub } from "graphql-subscriptions";
import { catchError, tap, throwError } from "rxjs";
import { AIDTO } from "./types/ai.types";

@Injectable()
export class EduAiService {
  private abortControllers: Map<string, AbortController> = new Map();

  constructor(
    private readonly httpService: HttpService,
    private prisma: PrismaService,
  ) {}

  async getAIModelAnswer(conversationId: string | null, userId: string, dto: AIDTO, botMode: "ChatAI" | "EduAI", pubSub?: PubSub): Promise<any> {
    let messagesHis: any[];
    if (conversationId) {
      const messagesHistory = await this.prisma.messageWithAI.findMany({
        where: {
          OR: [{ chatWithAIId: conversationId }, { courseAIHistoryId: conversationId }],
        },
      });
      messagesHis = messagesHistory.map(message => ({
        role: message.role.toLowerCase(),
        content: message.content,
        ...(message.role === "USER" && { content_type: "text" }),
        ...(message.type && { type: message.type }),
      }));
    }

    logger.log(messagesHis || 1);
    let botId: string;

    switch (botMode) {
      case "ChatAI":
        botId = process.env.CHATAI_ID;
        break;
      case "EduAI":
        botId = process.env.WHAI_AI_ID;
        break;
      default:
        throw new Error("Invalid bot mode");
    }
    const abortController = new AbortController();
    this.abortControllers.set(conversationId, abortController);
    const storedAbortController = this.abortControllers.get(conversationId);
    if (storedAbortController) {
      logger.log(`AbortController успешно сохранен для conversationId: ${conversationId}`);
    } else {
      logger.warn(`Не удалось сохранить AbortController для conversationId: ${conversationId}`);
    }
    return new Promise((resolve, reject) => {
      let dataBuffer = "";
      let messages = [];

      this.httpService
        .post(
          `${process.env.AI_API_URL}`,
          {
            conversation_id: conversationId,
            bot_id: botId,
            user: userId,
            query: JSON.stringify(dto.content),
            content_type: "answer",
            stream: true,
            chat_history: messagesHis || [],
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.WHAI_AI_KEY}`,
              "Content-Type": "application/json; charset=utf-8",
              Accept: "text/markdown; charset=utf-8",
              Host: "api.coze.com",
              Connection: "keep-alive",
            },
            responseType: "stream",
            signal: abortController.signal,
          },
        )
        .pipe(
          tap(response => {
            response.data.setEncoding("utf8");
            response.data.on("data", chunk => {
              dataBuffer += chunk;

              let boundaryIndex;
              while ((boundaryIndex = dataBuffer.indexOf("\n\n")) !== -1) {
                const completeMessage = dataBuffer.substring(0, boundaryIndex);
                dataBuffer = dataBuffer.substring(boundaryIndex + 2);

                const eventData = completeMessage.replace(/^data:/, "").trim();
                try {
                  const parsedData = JSON.parse(eventData);
                  // logger.log(parsedData);
                  const messageData = {
                    id: randomUUID(),

                    event: parsedData.event,
                    message: {
                      ...parsedData.message,
                      role: "ASSISTANT",
                    },
                    conversation_id: conversationId,
                    is_finish: parsedData.is_finish,
                  };
                  messages.push(messageData);
                  if (pubSub) {
                    pubSub.publish("chatWithAIAnswer", {
                      chatWithAIAnswer: messageData,
                    });
                  }
                } catch (error) {
                  console.error("Error parsing JSON:", error);
                }
              }
            });

            response.data.on("end", () => {
              this.abortControllers.delete(conversationId); // Удаляем контроллер после завершения
              const filteredMessages = messages.filter(m => m.message && m.message.type === "answer");

              if (filteredMessages.length > 0) {
                const fullContent = filteredMessages.map(m => m.message.content).join("");
                resolve(fullContent);
              } else {
                resolve([]);
              }
            });

            response.data.on("error", error => {
              this.abortControllers.delete(conversationId); // Удаляем контроллер при ошибке
              console.error("Error with the stream:", error);
              reject(error);
            });
          }),
          catchError(async error => {
            this.abortControllers.delete(conversationId);
            return throwError(() => new Error(`HTTP error: ${error}`));
          }),
        )
        .subscribe();
    });
  }

  stopGeneration(conversationId: string): void {
    if (!conversationId) {
      logger.log("No conversationId provided to stop generation.");
      return;
    }
    const abortController = this.abortControllers.get(conversationId);
    if (abortController) {
      abortController.abort();
      this.abortControllers.delete(conversationId);
      logger.log(`Generation stopped for conversationId: ${conversationId}`);
    } else {
      logger.log(`No active generation found for conversationId: ${conversationId}`);
    }
  }
}
