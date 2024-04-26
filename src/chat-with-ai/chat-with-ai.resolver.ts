import { Auth } from "@/auth/decorators/auth.decorator";
import { CurrentUser } from "@/auth/decorators/user.decorator";
import { Args, Mutation, Query, Resolver, Subscription } from "@nestjs/graphql";
import { PubSub } from "graphql-subscriptions";
import { FileUpload, GraphQLUpload } from "graphql-upload-ts";
import ChatWithAIService from "./chat-with-ai.service";
import { ChatWithAiRequestInput } from "./dto/ChatWithAiRequestInput";
import { ChatWithAI } from "./dto/create-chat-with-ai.input";
import { ChatWithAiAnswerResponse, CreateChatWithAIInput, GetAllMessagesInput, MessageWithAI } from "./dto/messages.input";
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

  @Subscription(() => ChatWithAiAnswerResponse, {
    description: "Subscribes to the AI's answers in real-time.",
    filter: (payload, variables) => {
      return payload.chatWithAIAnswer.conversation_id === variables.chatWithAIId;
    },
  })
  chatWithAIAnswer(@Args("chatWithAIId") chatWithAIId: string) {
    return pubSub.asyncIterator("chatWithAIAnswer");
  }
  @Mutation(() => MessageWithAI)
  @Auth("user")
  async createMessageWithAI(
    @CurrentUser("id") userId: string,
    @Args("chatWithAIRequestDto") dto: ChatWithAiRequestInput,
    @Args("file", { type: () => GraphQLUpload, nullable: true }) file?: Promise<FileUpload>,
  ): Promise<any> {
    try {
      const result = await this.chatWithAI.getAIModelAnswer(userId, dto, pubSub);

      return result;
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
