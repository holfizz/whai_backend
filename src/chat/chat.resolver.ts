import { Auth } from "@/auth/decorators/auth.decorator";
import { CurrentUser } from "@/auth/decorators/user.decorator";
import { Message } from "@/message/entities/message.entity";
import { Body } from "@nestjs/common";
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { ChatService } from "./chat.service";
import { CreateChatInput } from "./dto/create-chat.input";
import { UpdateChatInput } from "./dto/update-chat.input";
import { Chat } from "./entities/chat.entity";

@Resolver(() => Chat)
export class ChatResolver {
  constructor(private readonly chatService: ChatService) {}

  @Mutation(() => Chat)
  @Auth("user")
  createChat(@CurrentUser("id") userId: number, @Args("createChatDto") @Body() createChatDto: CreateChatInput) {
    return this.chatService.createChat(userId, createChatDto);
  }

  @Auth("user")
  @Query(() => [Chat])
  getAllChats(@CurrentUser("id") userId: number) {
    return this.chatService.getAllChats(userId);
  }

  @Mutation(() => Chat)
  @Auth("user")
  updateChat(@CurrentUser("id") userId: number, @Args("id") id: number, @Args("updateChatDto") @Body() updateChatDto: UpdateChatInput) {
    return this.chatService.updateChat(userId, id, updateChatDto);
  }

  @Mutation(() => Chat)
  @Auth("user")
  deleteChat(@CurrentUser("id") userId: number, @Args("id") id: number) {
    return this.chatService.deleteChat(userId, id);
  }

  @Query(() => [Message])
  @Auth("user")
  getAllMessages(@CurrentUser("id") userId: number, @Args("chatId") chatId: number) {
    return this.chatService.getAllMessages(userId, chatId);
  }
}
