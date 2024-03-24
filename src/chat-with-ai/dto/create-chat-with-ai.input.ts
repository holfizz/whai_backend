import { Field, InputType, Int, ObjectType, registerEnumType } from "@nestjs/graphql";
import { ApiProperty } from "@nestjs/swagger";
import { MessageWIthAIFrom } from "@prisma/client";
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

  @ApiProperty({
    example: "what is 1 + 1",
    description: "Your request ChatGpt",
  })
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
  @ApiProperty({
    example: "2",
    description: "ChatGpt answer",
  })
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

registerEnumType(MessageWIthAIFrom, {
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
  @Field(() => MessageWIthAIFrom)
  from: string;

  @IsNumber()
  @Field(() => Int)
  chatWithAIId: number;
}
@ObjectType()
export class ChatWithAI {
  @Field(() => Int)
  @IsNumber()
  id: number;

  @Field(() => String)
  @IsString()
  title: string;

  @Field(() => String)
  @IsString()
  userId: number;
}
