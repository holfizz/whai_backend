import { Field, ID, InputType, Int } from "@nestjs/graphql";
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from "class-validator";

@InputType()
export class MessageWithAIInput {
  @Field(() => ID, { nullable: true })
  @IsUUID()
  @IsOptional()
  chatWithAIId?: string;

  @Field(() => ID, { nullable: true })
  @IsUUID()
  @IsOptional()
  courseAIHistoryId?: string;

  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  content: string;
}

@InputType()
export class GetAllMessagesInput {
  @Field(() => ID)
  @IsUUID()
  chatId: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  take?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  skip?: number;
}
