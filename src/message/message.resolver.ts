import { Auth } from "@/auth/decorators/auth.decorator";
import { CurrentUser } from "@/auth/decorators/user.decorator";
import { Args, Mutation, Resolver, Subscription } from "@nestjs/graphql";
import { PubSub } from "graphql-subscriptions";
import { CreateMessageInput } from "./dto/create-message.input";
import { UpdateMessageInput } from "./dto/update-message.input";
import { Message } from "./entities/message.entity";
import { MessageService } from "./message.service";

const pubSub = new PubSub();
@Resolver(Message)
export class MessageResolver {
  constructor(private readonly messageService: MessageService) {}

  @Mutation(() => Message)
  @Auth("user")
  createMessage(@CurrentUser("id") userId: number, @Args("createMessageInput") createMessageInput: CreateMessageInput) {
    const message = this.messageService.createMessage(userId, createMessageInput);
    pubSub.publish("newMessage", { newMessage: message });
    return message;
  }

  @Mutation(() => Message)
  @Auth("user")
  updateMessage(@CurrentUser("id") userId: number, @Args("messageId") messageId: number, @Args("updateMessageInput") updateMessageInput: UpdateMessageInput) {
    const updatedMessage = this.messageService.updateMessage(userId, messageId, updateMessageInput);
    pubSub.publish("updatedMessage", { updatedMessage });
    return updatedMessage;
  }

  @Mutation(() => Message)
  @Auth("user")
  deleteMessage(@CurrentUser("id") userId: number, @Args("id") id: number) {
    const deletedMessage = this.messageService.deleteMessage(userId, id);
    pubSub.publish("deletedMessage", { deletedMessage });
    return deletedMessage;
  }

  @Subscription(() => Message, {
    filter: (payload, variables) => payload.newMessage.recipientId === variables.userId,
  })
  newMessage() {
    return pubSub.asyncIterator("newMessage");
  }
}
