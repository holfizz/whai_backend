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

  @Mutation(() => Chat, { description: "Create a new chat associated with the current user." })
  @Auth("user")
  async createChat(@CurrentUser("id") userId: string, @Args("createChatDto") @Body() createChatDto: CreateChatInput) {
    const chat = await this.chatService.createChat(userId, createChatDto);
    return chat;
  }

  @Query(() => [Chat], { description: "Retrieve all chats for the current user." })
  @Auth("user")
  async getAllChats(@CurrentUser("id") userId: string) {
    return await this.chatService.getAllChats(userId);
  }

  @Mutation(() => Chat, { description: "Update the details of an existing chat for the current user." })
  @Auth("user")
  async updateChat(@CurrentUser("id") userId: string, @Args("id") id: string, @Args("updateChatDto") @Body() updateChatDto: UpdateChatInput) {
    return await this.chatService.updateChat(userId, id, updateChatDto);
  }

  @Mutation(() => Chat, { description: "Delete an existing chat for the current user." })
  @Auth("user")
  async deleteChat(@CurrentUser("id") userId: string, @Args("id") id: string) {
    return await this.chatService.deleteChat(userId, id);
  }

  @Query(() => [Message], { description: "Retrieve all messages from a specific chat for the current user." })
  @Auth("user")
  async getAllMessages(@CurrentUser("id") userId: string, @Args("chatId") chatId: string) {
    return await this.chatService.getAllMessages(userId, chatId);
  }
}
