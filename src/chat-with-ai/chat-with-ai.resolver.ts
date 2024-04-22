import { Auth } from "@/auth/decorators/auth.decorator";
import { CurrentUser } from "@/auth/decorators/user.decorator";
import { Args, Mutation, Query, Resolver, Subscription } from "@nestjs/graphql";
import { PubSub } from "graphql-subscriptions";
import { FileUpload, GraphQLUpload } from "graphql-upload-ts";
import ChatWithAIService from "./chat-with-ai.service";
import { ChatWithAI } from "./dto/create-chat-with-ai.input";
import { ChatWithAiAnswerResponse, ChatWithAiRequestInput, CreateChatWithAIInput, GetAllMessagesInput } from "./dto/messages.input";
const pubSub = new PubSub();

@Resolver(ChatWithAI)
export class ChatWithAIResolver {
  constructor(private readonly chatWithAI: ChatWithAIService) {}

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

  @Mutation(() => ChatWithAiAnswerResponse, { description: "Sends a message from the user to the AI chat session and receives a reply from the AI." })
  @Auth("user")
  async createMessageWithAI(
    @CurrentUser("id") userId: string,
    @Args("chatWithAIRequestDto") chatWithAIRequestDto: ChatWithAiRequestInput,
    @Args("file", { type: () => GraphQLUpload, nullable: true }) file?: Promise<FileUpload>,
  ) {
    const userMessage = await this.chatWithAI.saveUserAIMessage(chatWithAIRequestDto, file, userId);
    await pubSub.publish("chatWithAIAnswer", { messageWithAiCreate: userMessage });
    if (chatWithAIRequestDto.content) {
      const aiAnswer = await this.chatWithAI.createMessageWithAI(chatWithAIRequestDto, userId);
      await pubSub.publish("chatWithAIAnswer", { messageWithAiCreate: aiAnswer });
      return aiAnswer;
    }
    return "error";
  }
  @Subscription(() => ChatWithAiAnswerResponse, {
    description: "Subscribes to AI responses in an AI chat session.",
  })
  aiMessageResponse(@Args("chatWithAIId") chatWithAIId: string): AsyncIterator<ChatWithAiAnswerResponse> {
    return pubSub.asyncIterator<ChatWithAiAnswerResponse>("aiMessageResponse");
  }

  @Subscription(() => ChatWithAiAnswerResponse, { description: "Start a chat session with AI." })
  @Auth("user")
  async startChatSessionWithAI(@CurrentUser("id") userId: string, @Args("chatWithAIRequestDto") chatWithAIRequestDto: ChatWithAiRequestInput) {
    const userMessage = await this.chatWithAI.saveUserAIMessage(chatWithAIRequestDto, null, userId);
    const aiAnswer = await this.chatWithAI.createMessageWithAI(chatWithAIRequestDto, userId);

    return true;
  }
  @Subscription(() => ChatWithAiAnswerResponse, {
    description: "Subscribes to messages exchanged between the user and the AI in a specific chat session.",
    filter: (payload, variables) => payload.messageWithAiCreate.chatWithAIId === variables.chatWithAIId,
  })
  messageWithAiCreate(@Args("chatWithAIId", { type: () => String }) chatWithAIId: string): AsyncIterator<ChatWithAiAnswerResponse> {
    console.log();
    return pubSub.asyncIterator<ChatWithAiAnswerResponse>("chatWithAIAnswer");
  }

  @Query(() => [ChatWithAiAnswerResponse], { description: "Retrieves all messages within a specific AI chat session for the current user." })
  @Auth("user")
  async getAllMessageInChatWithAI(@CurrentUser("id") userId: string, @Args("dto") dto: GetAllMessagesInput) {
    return this.chatWithAI.getAllMessagesInChatWithAI(userId, dto);
  }
}
