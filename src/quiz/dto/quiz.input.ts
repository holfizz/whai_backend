import { Field, ID, InputType, registerEnumType } from "@nestjs/graphql";
import { QuizQuestionType } from "@prisma/client";
import { Type } from "class-transformer";
import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, ValidateNested } from "class-validator";

registerEnumType(QuizQuestionType, {
  name: "QuizQuestionType",
});

@InputType()
export class ChoiceInput {
  @Field(() => String)
  content: string;

  @Field(() => ID, { nullable: true })
  @IsUUID()
  @IsOptional()
  quizId?: string;

  @Field(() => ID, { nullable: true })
  @IsUUID()
  interactionId?: string;
}

@InputType()
export class InteractionInput {
  @Field(() => [String])
  @IsArray()
  answers: string[];

  @Field(() => [ChoiceInput])
  @ValidateNested({ each: true })
  @Type(() => ChoiceInput)
  choices: ChoiceInput[];
}

@InputType()
export class SideTypeInput {
  @Field(() => String)
  @IsString()
  content: string;
}

@InputType()
export class MatchingInteractionInput {
  @Field(() => ID, { nullable: true })
  @IsUUID()
  @IsOptional()
  id?: string;

  @Field(() => [SideTypeInput])
  @ValidateNested({ each: true })
  @Type(() => SideTypeInput)
  left: SideTypeInput[];

  @Field(() => [SideTypeInput])
  @ValidateNested({ each: true })
  @Type(() => SideTypeInput)
  right: SideTypeInput[];

  @Field(() => [[String]])
  answers: string[][];
}

@InputType()
export class QuizInput {
  @Field(() => String)
  @IsString()
  title: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  stimulus?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  lessonBlockId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  folderId?: string;

  @Field(() => QuizQuestionType)
  @IsEnum(QuizQuestionType)
  questionType: QuizQuestionType;

  @Field(() => [ChoiceInput], { nullable: true })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChoiceInput)
  @IsOptional()
  choices?: ChoiceInput[];

  @Field(() => [InteractionInput], { nullable: true })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InteractionInput)
  @IsOptional()
  interactions?: InteractionInput[];

  @Field(() => MatchingInteractionInput, { nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => MatchingInteractionInput)
  matchingInteraction?: MatchingInteractionInput;

  @Field(() => String)
  @IsString()
  prompt: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  answers?: string[];

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  instructions?: string;
}
@InputType()
export class QuizWithAIInput {
  @IsString()
  @Field(() => ID)
  @IsUUID()
  chatWithAIId: string;

  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  content: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  lessonBlockId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  folderId?: string;
}
