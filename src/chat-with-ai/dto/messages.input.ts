import { Field, ID, InputType, ObjectType, registerEnumType } from "@nestjs/graphql";
import { MessageWithAIRole } from "@prisma/client";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";
@InputType()
export class CreateChatWithAIInput {
  @IsString()
  @Field(() => String, { nullable: true })
  title?: string;
}

@InputType()
export class ChatWithAiRequestInput {
  @IsString()
  @Field(() => ID)
  chatWithAIId: string;

  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  content: string;
}

@ObjectType()
export class ChatWithAiAnswerInput {
  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  aiMessage: string;
}
registerEnumType(MessageWithAIRole, {
  name: "MessageWithAIRole",
});
@ObjectType()
export class MessageWithAI {
  @Field(() => MessageWithAIRole)
  role: MessageWithAIRole;

  @Field(() => String)
  type: string;

  @Field(() => String)
  content: string;

  @Field(() => String, { nullable: true })
  content_type?: string;

  @Field(() => String, { nullable: true })
  extra_info?: string;
}

@ObjectType()
export class ChatWithAiAnswerResponse {
  @Field(() => ID)
  id: string;

  @Field(() => MessageWithAI)
  message: MessageWithAI;

  @Field(() => String)
  conversation_id: string;

  @Field(() => Boolean)
  is_finish: boolean;

  @Field(() => String, { nullable: true })
  index?: number;
}
@InputType()
export class GetAllMessagesInput {
  @IsString()
  @Field(() => ID)
  chatId: string;

  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  perPage?: string;

  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  page?: string;
}
