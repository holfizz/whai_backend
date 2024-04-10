import { Field, InputType, Int, ObjectType, registerEnumType } from "@nestjs/graphql";
import { MessageWithAIFrom } from "@prisma/client";
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
@InputType()
export class CreateChatWithAIInput {
  @IsString()
  @Field(() => String, { nullable: true })
  title?: string;
}

@InputType()
export class ChatWithAiRequestInput {
  @IsNumber()
  @Field(() => Int)
  chatWithAIId: number;

  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  file?: string;

  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  text: string;
}

@ObjectType()
export class ChatWithAiAnswerInput {
  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  aiMessage: string;
  static getInstance(aiMessage: string) {
    const result = new ChatWithAiAnswerInput();
    result.aiMessage = aiMessage;
    return result;
  }
}

registerEnumType(MessageWithAIFrom, {
  name: "MessageWIthAIFrom",
});
@ObjectType()
export class ChatWithAiAnswerResponse {
  @IsNumber()
  @IsNotEmpty()
  @Field(() => Number)
  id: number;

  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  text: string;

  @IsString()
  @IsNotEmpty()
  @Field(() => MessageWithAIFrom)
  from: string;

  @IsNumber()
  @Field(() => Int)
  chatWithAIId: number;
}
@InputType()
export class GetAllMessagesInput {
  @IsNumber()
  @Field(() => Int)
  chatId: number;

  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  perPage?: string;

  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  page?: string;
}
