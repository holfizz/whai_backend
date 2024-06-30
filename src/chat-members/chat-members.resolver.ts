import { Auth } from "@/auth/decorators/auth.decorator";
import { CurrentUser } from "@/auth/decorators/user.decorator";
import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { ChatMembersService } from "./chat-members.service";
import { ChatMember } from "./entities/chat-member.entity";

@Resolver(() => ChatMember)
export class ChatMembersResolver {
  constructor(private readonly chatMembersService: ChatMembersService) { }

  @Mutation(() => ChatMember, { description: "Allows a user to enter a chat room, adding them to the chat's members list." })

  @Auth("user")
  enterChat(@CurrentUser("id") userId: string, @Args("chatId") chatId: string) {
    return this.chatMembersService.enterChat(userId, chatId);
  }

  @Mutation(() => ChatMember, { description: "Allows a user to leave a chat room, removing them from the chat's members list." })
  @Auth("user")
  leaveChat(@CurrentUser("id") userId: string, @Args("chatId") chatId: string) {
    return this.chatMembersService.leaveChat(userId, chatId);
  }
}
