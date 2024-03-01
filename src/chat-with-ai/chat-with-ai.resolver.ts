import { Auth } from "@/auth/decorators/auth.decorator";
import { CurrentUser } from "@/auth/decorators/user.decorator";
import { CreateChatInput } from "@/chat/dto/create-chat.input";
import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { FileUpload, GraphQLUpload } from "graphql-upload-ts";
import ChatWithAIService from "./chat-with-ai.service";
import { ChatWithAI, ChatWithAiAnswerResponse, ChatWithAiRequestInput } from "./dto/create-chat-with-ai.input";
@Resolver(ChatWithAI)
export class ChatWithAIResolver {
  constructor(private readonly chatWithAI: ChatWithAIService) {}

  @Mutation(() => ChatWithAI)
  @Auth("user")
  async createChatWithAi(@CurrentUser("id") userId: number, @Args("createChatInput", { nullable: true }) createChatInput: CreateChatInput) {
    return this.chatWithAI.createChatWithAI(userId, createChatInput);
  }

  @Mutation(() => ChatWithAiAnswerResponse)
  @Auth("user")
  async createMessageWithAi(
    @CurrentUser("id") userId: number,
    @Args("chatWithAIRequestDto") chatWithAIRequestDto: ChatWithAiRequestInput,
    @Args("file", { type: () => GraphQLUpload, nullable: true }) file?: Promise<FileUpload>,
  ) {
    return this.chatWithAI.createMessageWithAI(userId, chatWithAIRequestDto, file);
  }

  // @Query(() => [])
  // @Auth("user")
  // async getUserChats(@Args("id") id: string) {
  //   return this.chatWithAI.getAllMessageInChatWithAI(parseInt(id, 10));
  // }
}
