import { Auth } from "@/auth/decorators/auth.decorator";
import { CurrentUser } from "@/auth/decorators/user.decorator";
import { Args, Int, Mutation, Query, Resolver, Subscription } from "@nestjs/graphql";
import { PubSub } from "graphql-subscriptions";
import { FileUpload, GraphQLUpload } from "graphql-upload-ts";
import ChatWithAIService from "./chat-with-ai.service";
import { ChatWithAI } from "./dto/create-chat-with-ai.input";
import { ChatWithAiAnswerResponse, ChatWithAiRequestInput, CreateChatWithAIInput, GetAllMessagesInput } from "./dto/messages.input";
const pubSub = new PubSub();

@Resolver(ChatWithAI)
export class ChatWithAIResolver {
  constructor(private readonly chatWithAI: ChatWithAIService) {}

  @Mutation(() => ChatWithAI)
  @Auth("user")
  async createChatWithAi(@CurrentUser("id") userId: number, @Args("createChatInput", { nullable: true }) createChatInput: CreateChatWithAIInput) {
    return this.chatWithAI.createChatWithAI(userId, createChatInput);
  }

  @Mutation(() => ChatWithAiAnswerResponse)
  @Auth("user")
  async createMessageWithAi(
    @CurrentUser("id") userId: number,
    @Args("chatWithAIRequestDto") chatWithAIRequestDto: ChatWithAiRequestInput,
    @Args("file", { type: () => GraphQLUpload, nullable: true }) file?: Promise<FileUpload>,
  ) {
    const userMessage = await this.chatWithAI.saveUserAIMessage(chatWithAIRequestDto, file, userId);
    await pubSub.publish("chatWithAIAnswer", { messageWithAiCreate: userMessage });
    if (userMessage) {
      const aiAnswer = await this.chatWithAI.createMessageWithAI(chatWithAIRequestDto, file);
      await pubSub.publish("chatWithAIAnswer", { messageWithAiCreate: aiAnswer });
      return aiAnswer;
    }
    return "error";
  }

  @Subscription(() => ChatWithAiAnswerResponse, {
    filter: (payload, variables) => payload.messageWithAiCreate.chatWithAIId === variables.chatWithAIId,
  })
  messageWithAiCreate(@Args("chatWithAIId", { type: () => Int! }) chatWithAIId: number): AsyncIterator<ChatWithAiAnswerResponse> {
    return pubSub.asyncIterator<ChatWithAiAnswerResponse>("chatWithAIAnswer");
  }

  @Query(() => [ChatWithAiAnswerResponse])
  @Auth("user")
  async getAllMessageInChatWithAI(@CurrentUser("id") userId: number, @Args("dto") dto: GetAllMessagesInput) {
    return this.chatWithAI.getAllMessagesInChatWithAI(userId, dto);
  }

  // @Query(() => [])
  // @Auth("user")
  // async getUserChats(@Args("id") id: string) {
  //   return this.chatWithAI.getAllMessageInChatWithAI(parseInt(id, 10));
  // }
}
