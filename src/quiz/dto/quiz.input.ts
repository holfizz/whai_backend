import { Field, ID, InputType, Int, registerEnumType } from "@nestjs/graphql";
import { QuizQuestionType } from "@prisma/client";
import { Type } from "class-transformer";
import { IsArray, IsBoolean, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min, ValidateNested } from "class-validator";

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
export class QuestionInput {
  @Field(() => QuizQuestionType)
  @IsEnum(QuizQuestionType)
  questionType: QuizQuestionType;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  stimulus?: string;

  @Field(() => String)
  @IsString()
  prompt: string;

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

  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  completionTime?: number;

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  isPlan?: boolean;
}

@InputType()
export class QuizWithAIInput {
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
  chatWithAIId: string;

  @Field(() => ID)
  @IsUUID()
  courseId: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  subtopicId?: string;
}

@InputType()
class UserAnswerInput {
  @Field(() => ID)
  @IsUUID()
  questionId: string;

  @Field(() => [String])
  @IsArray()
  selectedAnswer: string[];

  @Field(() => Boolean)
  @IsBoolean()
  isCorrect: boolean;
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
  subtopicId: string;

  @Field(() => Int)
  @IsNumber()
  totalPercents: number;

  @Field(() => Int)
  @IsInt()
  @Min(0)
  correctAnswers: number;

  @Field(() => Int)
  @IsInt()
  @Min(0)
  wrongAnswers: number;

  @Field(() => Int)
  @IsInt()
  @Min(0)
  completionTime: number; // время выполнения в секундах

  @Field(() => UserAnswerInput)
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UserAnswerInput)
  userAnswer: UserAnswerInput;
}
