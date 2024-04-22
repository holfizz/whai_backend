import { Auth } from "@/auth/decorators/auth.decorator";
import { CurrentUser } from "@/auth/decorators/user.decorator";
import { HttpService } from "@nestjs/axios";
import { Args, Mutation, Query, Resolver, Subscription } from "@nestjs/graphql";
import { randomUUID } from "crypto";
import { PubSub } from "graphql-subscriptions";
import { FileUpload, GraphQLUpload } from "graphql-upload-ts";
import { catchError, tap, throwError } from "rxjs";
import ChatWithAIService from "./chat-with-ai.service";
import { ChatWithAI } from "./dto/create-chat-with-ai.input";
import { ChatWithAiAnswerResponse, ChatWithAiRequestInput, CreateChatWithAIInput, GetAllMessagesInput } from "./dto/messages.input";
const pubSub = new PubSub();

@Resolver(ChatWithAI)
export class ChatWithAIResolver {
  constructor(
    private readonly chatWithAI: ChatWithAIService,
    private readonly httpService: HttpService,
  ) {}

  @Mutation(() => ChatWithAI, { description: "Creates a new AI chat session for the current user." })
  @Auth("user")
  async createChatWithAI(@CurrentUser("id") userId: string, @Args("createChatInput", { nullable: true }) createChatInput: CreateChatWithAIInput) {
    return this.chatWithAI.createChatWithAI(userId, createChatInput);
  }

  @Query(() => [ChatWithAI], { description: "Retrieves all AI chat sessions that the current user is part of." })
  @Auth("user")
  async getAllChatsWithAI(@CurrentUser("id") userId: string) {
    return this.chatWithAI.getAllChatsWithAi(userId);
  }

  @Subscription(() => ChatWithAiAnswerResponse, {
    description: "Subscribes to the AI's answers in real-time.",
    filter: (payload, variables) => {
      console.log(123123, payload);
      console.log(1231231312);
      console.log(1231231231, variables);
      return true;
    },
  })
  chatWithAIAnswer() {
    return pubSub.asyncIterator("chatWithAIAnswer");
  }
  @Mutation(() => ChatWithAiAnswerResponse)
  @Auth("user")
  async createMessageWithAI(
    @CurrentUser("id") userId: string,
    @Args("chatWithAIRequestDto") dto: ChatWithAiRequestInput,
    @Args("file", { type: () => GraphQLUpload, nullable: true }) file?: Promise<FileUpload>,
  ): Promise<any> {
    try {
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
                  console.log(parsedData.message.content);

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

            response.data.on("error", error => {
              console.error("Error with the stream:", error);
            });
          }),
          catchError(error => throwError(() => new Error(`HTTP error: ${error}`))),
        )
        .subscribe();
      return {
        isComplete: false,
      };
    } catch (error) {
      throw new Error(`Error processing chat message: ${error.message}`);
    }
  }

  @Query(() => [ChatWithAiAnswerResponse], { description: "Retrieves all messages within a specific AI chat session for the current user." })
  @Auth("user")
  async getAllMessageInChatWithAI(@CurrentUser("id") userId: string, @Args("dto") dto: GetAllMessagesInput) {
    return this.chatWithAI.getAllMessagesInChatWithAI(userId, dto);
  }
}
