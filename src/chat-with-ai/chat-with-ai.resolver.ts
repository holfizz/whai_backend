import { Auth } from "@/auth/decorators/auth.decorator";
import { CurrentUser } from "@/auth/decorators/user.decorator";
import { Args, ID, Mutation, Query, Resolver } from "@nestjs/graphql";
import ChatWithAIService from "./chat-with-ai.service";
import { ChatWithAIInput } from "./dto/chat-with-ai.Input";
import { ChatWithAI } from "./entities/chat-with-ai.entity";

@Resolver(ChatWithAI)
export class ChatWithAIResolver {
  constructor(private readonly chatWithAI: ChatWithAIService) {}

  @Mutation(() => ChatWithAI)
  @Auth("user")
  async createChatWithAI(@CurrentUser("id") userId: string, @Args("createChatInput") createChatInput: ChatWithAIInput) {
    return this.chatWithAI.createChatWithAI(userId, createChatInput);
  }

  @Query(() => [ChatWithAI])
  @Auth("user")
  async getAllChatsWithAI(@CurrentUser("id") userId: string, @Args("lessonId", { type: () => ID }) lessonId: string) {
    return this.chatWithAI.getAllChatsWithAI(userId, lessonId);
  }

  @Query(() => ChatWithAI)
  @Auth("user")
  async getChatWithAI(
    @CurrentUser("id") userId: string,
    @Args("chatWithAIID", { type: () => ID })
    chatWithAIID: string,
  ) {
    return this.chatWithAI.getChatWithAI(userId, chatWithAIID);
  }
}
