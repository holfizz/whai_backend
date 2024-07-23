import { Auth } from "@/auth/decorators/auth.decorator";
import { CurrentUser } from "@/auth/decorators/user.decorator";
import { Args, ID, Int, Mutation, Query, Resolver, Subscription } from "@nestjs/graphql";
import { PubSub } from "graphql-subscriptions";
import { GenerateTDInput, GetAllMessagesInput, MessageWithAIInput } from "./dto/message-with-ai.input";
import { UpdateMessageWithAiInput } from "./dto/update-message-with-ai.input";
import { GenerateTD, MessageWithAI, MessageWithAIData } from "./entities/message-with-ai.entity";
import { MessageWithAiService } from "./message-with-ai.service";

const pubSub = new PubSub();

@Resolver(() => MessageWithAIData)
export class MessageWithAiResolver {
  constructor(private readonly messageWithAiService: MessageWithAiService) {}
  @Subscription(() => MessageWithAI, {
    filter: (payload, variables) => {
      return payload.chatWithAIAnswer.conversation_id === variables.chatWithAIId;
    },
  })
  chatWithAIAnswer(@Args("chatWithAIId") chatWithAIId: string) {
    return pubSub.asyncIterator("chatWithAIAnswer");
  }
  @Mutation(() => MessageWithAIData)
  @Auth("user")
  async createMessageWithAI(
    @CurrentUser("id") userId: string,
    @Args("chatWithAIRequestDto") dto: MessageWithAIInput,
    // @Args("file", { type: () => GraphQLUpload, nullable: true }) file?: Promise<FileUpload>,
  ): Promise<any> {
    try {
      const result = await this.messageWithAiService.getChatAIMAnswers(userId, dto, pubSub);

      return result;
    } catch (error) {
      throw new Error(`Error processing chat message: ${error.message}`);
    }
  }

  @Query(() => [MessageWithAIData])
  @Auth("user")
  async getAllMessageInChatWithAI(@CurrentUser("id") userId: string, @Args("dto") dto: GetAllMessagesInput) {
    return this.messageWithAiService.getAllMessagesInChatWithAI(userId, dto);
  }

  @Query(() => [MessageWithAIData])
  @Auth("user")
  async getMessagesByCourseAIHistoryId(@CurrentUser("id") userId: string, @Args("courseAIHistoryId", { type: () => ID }) courseAIHistoryId: string) {
    return this.messageWithAiService.getMessagesByCourseAIHistoryId(userId, courseAIHistoryId);
  }

  @Query(() => MessageWithAIData, { name: "messageWithAi" })
  findOne(@Args("id", { type: () => Int }) id: number) {
    return this.messageWithAiService.findOne(id);
  }

  @Mutation(() => MessageWithAIData)
  updateMessageWithAi(@Args("updateMessageWithAiInput") updateMessageWithAiInput: UpdateMessageWithAiInput) {
    return this.messageWithAiService.update(updateMessageWithAiInput.id, updateMessageWithAiInput);
  }

  @Mutation(() => [GenerateTD])
  @Auth("user")
  generateTD(@CurrentUser("id") userId: string, @Args("dto") dto: GenerateTDInput) {
    return this.messageWithAiService.generateTitleAndDescription(dto, userId);
  }
}
