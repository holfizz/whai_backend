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

  @Mutation(() => Message, { description: "Create a new message with the given content and associate it with the current user." })
  @Auth("user")
  createMessage(@CurrentUser("id") userId: string, @Args("createMessageInput") createMessageInput: CreateMessageInput) {
    const message = this.messageService.createMessage(userId, createMessageInput);
    pubSub.publish("newMessage", { newMessage: message });
    return message;
  }

  @Mutation(() => Message, { description: "Update an existing message with new content. Only the author of the message can update it." })
  @Auth("user")
  updateMessage(@CurrentUser("id") userId: string, @Args("messageId") messageId: string, @Args("updateMessageInput") updateMessageInput: UpdateMessageInput) {
    const updatedMessage = this.messageService.updateMessage(userId, messageId, updateMessageInput);
    pubSub.publish("updatedMessage", { updatedMessage });
    return updatedMessage;
  }

  @Mutation(() => Message, { description: "Delete a message. This can only be done by the author of the message or an admin." })
  @Auth("user")
  deleteMessage(@CurrentUser("id") userId: string, @Args("id") id: string) {
    const deletedMessage = this.messageService.deleteMessage(userId, id);
    pubSub.publish("deletedMessage", { deletedMessage });
    return deletedMessage;
  }

  @Subscription(() => Message, {
    description: "Subscribe to new messages targeted to the user. The user will receive notifications of new messages.",
    filter: (payload, variables) => payload.newMessage.recipientId === variables.userId,
  })
  newMessage() {
    return pubSub.asyncIterator("newMessage");
  }
}
