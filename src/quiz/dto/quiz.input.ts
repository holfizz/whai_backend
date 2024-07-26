import { Field, ID, InputType, registerEnumType } from "@nestjs/graphql";
import { QuizQuestionType } from "@prisma/client";
import { Type } from "class-transformer";
import { IsArray, IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, ValidateNested } from "class-validator";

registerEnumType(QuizQuestionType, {
  name: "QuizQuestionType",
});

@InputType()
export class ChoiceInput {
  @Field(() => String)
  content: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  correctAnswerDescription?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  incorrectAnswerDescription?: string;

  @Field(() => ID, { nullable: true })
  @IsUUID()
  @IsOptional()
  questionId?: string;

  @Field(() => ID, { nullable: true })
  @IsUUID()
  @IsOptional()
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
  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  content?: string;
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
export class QuestionInput {
  @Field(() => QuizQuestionType)
  @IsEnum(QuizQuestionType)
  questionType: QuizQuestionType;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  stimulus?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  prompt?: string;

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

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  answers?: string[];
}

@InputType()
export class QuizInput {
  @Field(() => ID)
  @IsUUID()
  courseId: string;

  @Field(() => String)
  @IsString()
  name: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field(() => [QuestionInput], { nullable: true })
  @ValidateNested({ each: true })
  @Type(() => QuestionInput)
  @IsOptional()
  questions?: QuestionInput[];

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  subtopicId?: string;

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  isPlan?: boolean;
}

@InputType()
export class QuizWithAIInput {
  @Field(() => ID)
  @IsUUID()
  id: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  name: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  additionalParams?: string;

  @IsString()
  @Field(() => ID)
  @IsUUID()
  courseAIHistoryId: string;

  @Field(() => ID)
  @IsUUID()
  courseId: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  subtopicId?: string;
}

@InputType()
export class MatchingAnswerInput {
  @Field(() => String)
  left: string;

  @Field(() => String)
  right: string;
}

@InputType()
export class UserAnswerInput {
  @Field(() => ID)
  @IsUUID()
  questionId: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  selectedAnswers?: string[];

  @Field(() => [MatchingAnswerInput], { nullable: true })
  @IsOptional()
  @IsArray()
  matchingAnswers?: MatchingAnswerInput[];
}
@InputType()
export class SaveQuizResultInput {
  @Field(() => ID)
  @IsUUID()
  quizId: string;

  @Field(() => ID)
  @IsUUID()
  courseId: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  subtopicId?: string;

  @Field(() => [UserAnswerInput])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UserAnswerInput)
  userAnswers: UserAnswerInput[];
}
