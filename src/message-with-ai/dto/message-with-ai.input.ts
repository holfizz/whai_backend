import { Field, ID, InputType, Int } from "@nestjs/graphql";
import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from "class-validator";
enum TDType {
  COURSE,
  LESSON,
  TEST,
}
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

  @Field(() => ID)
  @IsUUID()
  lessonId: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  message: string;
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

@InputType()
export class GenerateTDInput {
  @Field(() => ID, { nullable: true })
  @IsUUID()
  @IsOptional()
  conversationId?: string;

  @Field(() => String)
  @IsString()
  userRequest: string;

  @Field(() => String)
  @IsString()
  @IsEnum(TDType)
  type: TDType;
}
@InputType()
export class KnowledgeSumInput {
  @Field(() => ID)
  @IsUUID()
  conversationId: string;

  @Field(() => ID)
  @IsString()
  quizResultId: string;

  @Field(() => ID)
  @IsString()
  courseId: string;
}
@InputType()
export class BlockInput {
  @Field(() => ID, { nullable: true })
  @IsUUID()
  @IsOptional()
  courseId?: string;

  @Field(() => ID, { nullable: true })
  @IsUUID()
  @IsOptional()
  topicId?: string;

  @Field(() => ID, { nullable: true })
  @IsUUID()
  @IsOptional()
  subtopicId?: string;

  @Field(() => String)
  @IsString()
  @IsOptional()
  userRequest: string;

  @Field(() => String)
  @IsString()
  @IsOptional()
  type: string;

  @Field(() => Boolean)
  @IsBoolean()
  @IsOptional()
  isAutofill: boolean;
}
