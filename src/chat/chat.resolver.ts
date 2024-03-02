import { Auth } from "@/auth/decorators/auth.decorator";
import { CurrentUser } from "@/auth/decorators/user.decorator";
import { Message } from "@/message/entities/message.entity";
import { Body } from "@nestjs/common";
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { PubSub } from "graphql-subscriptions";
import { ChatService } from "./chat.service";
import { CreateChatInput } from "./dto/create-chat.input";
import { UpdateChatInput } from "./dto/update-chat.input";
import { Chat } from "./entities/chat.entity";

const pubSub = new PubSub();
@Resolver(() => Chat)
export class ChatResolver {
  constructor(private readonly chatService: ChatService) {}

  @Mutation(() => Chat)
  @Auth("user")
  async createChat(@CurrentUser("id") userId: number, @Args("createChatDto") @Body() createChatDto: CreateChatInput) {
    const chat = await this.chatService.createChat(userId, createChatDto);
    return chat;
  }

  @Auth("user")
  @Query(() => [Chat])
  async getAllChats(@CurrentUser("id") userId: number) {
    return await this.chatService.getAllChats(userId);
  }

  @Mutation(() => Chat)
  @Auth("user")
  async updateChat(@CurrentUser("id") userId: number, @Args("id") id: number, @Args("updateChatDto") @Body() updateChatDto: UpdateChatInput) {
    return await this.chatService.updateChat(userId, id, updateChatDto);
  }

  @Mutation(() => Chat)
  @Auth("user")
  async deleteChat(@CurrentUser("id") userId: number, @Args("id") id: number) {
    return await this.chatService.deleteChat(userId, id);
  }

  @Query(() => [Message])
  @Auth("user")
  async getAllMessages(@CurrentUser("id") userId: number, @Args("chatId") chatId: number) {
    return await this.chatService.getAllMessages(userId, chatId);
  }
}
