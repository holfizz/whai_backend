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
  name: "MessageWIthAIFrom",
});
@ObjectType()
export class ChatWithAiAnswerResponse {
  @IsString()
  @IsNotEmpty()
  @Field(() => ID)
  id: string;

  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  content: string;

  @IsString()
  @IsNotEmpty()
  @Field(() => MessageWithAIRole)
  role: string;

  @IsString()
  @Field(() => ID)
  chatWithAIId: string;
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
