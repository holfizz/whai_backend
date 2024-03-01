import { Auth } from "@/auth/decorators/auth.decorator";
import { CurrentUser } from "@/auth/decorators/user.decorator";
import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { CreateMessageInput } from "./dto/create-message.input";
import { UpdateMessageInput } from "./dto/update-message.input";
import { Message } from "./entities/message.entity";
import { MessageService } from "./message.service";

@Resolver(Message)
export class MessageResolver {
  constructor(private readonly messageService: MessageService) {}
  @Mutation(() => Message)
  @Auth("user")
  createMessage(@CurrentUser("id") userId: number, @Args("createMessageInput") createMessageInput: CreateMessageInput) {
    return this.messageService.createMessage(userId, createMessageInput);
  }

  @Mutation(() => Message)
  @Auth("user")
  updateMessage(@CurrentUser("id") userId: number, @Args("id") id: number, @Args("updateMessageInput") updateMessageInput: UpdateMessageInput) {
    return this.messageService.updateMessage(userId, id, updateMessageInput);
  }

  @Mutation(() => Message)
  @Auth("user")
  deleteMessage(@CurrentUser("id") userId: number, @Args("id") id: number) {
    return this.messageService.deleteMessage(userId, id);
  }
}
