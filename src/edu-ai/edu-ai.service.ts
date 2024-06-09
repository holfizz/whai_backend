import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { randomUUID } from "crypto";
import { PubSub } from "graphql-subscriptions";
import { catchError, tap, throwError } from "rxjs";
import { AIDTO } from "./types/ai.types";

@Injectable()
export class EduAiService {
  private abortControllers: Map<string, AbortController> = new Map();

  constructor(private readonly httpService: HttpService) {}

  async getAIModelAnswer(conversationId: string, userId: string, dto: AIDTO, botMode: "ChatAI" | "EduAI", pubSub: PubSub): Promise<any> {
    const messagesHistory = dto.messagesHistory;
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

    // Сохраняем AbortController для возможности отмены запроса
    this.abortControllers.set(conversationId, abortController);

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
            query: dto.content,
            content_type: "answer",
            stream: true,
            chat_history: messagesHistory,
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
                  console.log(parsedData);
                  const messageData = {
                    id: randomUUID(),
                    event: parsedData.event,
                    message: parsedData.message,
                    conversation_id: conversationId,
                    is_finish: parsedData.is_finish,
                  };
                  messages.push(messageData);
                  pubSub.publish("chatWithAIAnswer", {
                    chatWithAIAnswer: messageData,
                  });
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
    const abortController = this.abortControllers.get(conversationId);
    if (abortController) {
      abortController.abort();
      this.abortControllers.delete(conversationId);
    }
  }
}
