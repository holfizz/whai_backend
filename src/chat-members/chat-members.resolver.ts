import { Auth } from "@/auth/decorators/auth.decorator";
import { CurrentUser } from "@/auth/decorators/user.decorator";
import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { ChatMembersService } from "./chat-members.service";
import { ChatMember } from "./entities/chat-member.entity";

@Resolver(() => ChatMember)
export class ChatMembersResolver {
  constructor(private readonly chatMembersService: ChatMembersService) {}

  @Mutation(() => ChatMember)
  @Auth("user")
  enterChat(@CurrentUser("id") userId: number, @Args("chatId") chatId: number) {
    return this.chatMembersService.enterChat(userId, chatId);
  }

  @Mutation(() => ChatMember)
  @Auth("user")
  leaveChat(@CurrentUser("id") userId: number, @Args("chatId") chatId: number) {
    return this.chatMembersService.leaveChat(userId, chatId);
  }
}
