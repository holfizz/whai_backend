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
  title: string;

  @Field(() => [QuestionInput])
  @ValidateNested({ each: true })
  @Type(() => QuestionInput)
  questions: QuestionInput[];

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  lessonBlockId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  subtopicId?: string;

  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  completionTime?: number;
}

@InputType()
export class QuizWithAIInput {
  @IsString()
  @Field(() => ID)
  @IsUUID()
  @IsNotEmpty()
  chatWithAIId: string;

  @Field(() => ID)
  @IsUUID()
  @IsNotEmpty()
  courseId: string;

  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  @IsNotEmpty()
  content: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  lessonBlockId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  subtopicId?: string;

  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  completionTime?: number;
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
  courseId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  lessonId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  subtopicId?: string;

  @Field(() => Int)
  @IsInt()
  @Min(0)
  totalQuestions: number;

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

  @Field(() => [UserAnswerInput])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UserAnswerInput)
  userAnswers: UserAnswerInput[];
}
