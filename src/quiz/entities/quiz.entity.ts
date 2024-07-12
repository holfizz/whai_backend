import { BaseEntity } from "@/helpers/base.entity";
import { Field, ID, Int, ObjectType, registerEnumType } from "@nestjs/graphql";
import { QuizQuestionType } from "@prisma/client";
import { Type } from "class-transformer";
import { IsArray, IsEnum, IsNumber, IsOptional, IsString, IsUUID, ValidateNested } from "class-validator";

registerEnumType(QuizQuestionType, {
  name: "QuizQuestionType",
});

@ObjectType()
export class Choice {
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

@ObjectType()
export class Interaction {
  @Field(() => [String])
  answers: string[];

  @Field(() => [Choice])
  @ValidateNested({ each: true })
  @Type(() => Choice)
  choices: Choice[];
}

@ObjectType()
export class SideType {
  @Field(() => String)
  @IsString()
  content: string;
}

@ObjectType()
export class MatchingInteraction {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  id?: string;

  @Field(() => [SideType])
  @ValidateNested({ each: true })
  @Type(() => SideType)
  left: SideType[];

  @Field(() => [SideType])
  @ValidateNested({ each: true })
  @Type(() => SideType)
  right: SideType[];

  @Field(() => [[String]])
  answers: string[][];
}

@ObjectType()
export class Question {
  @Field(() => ID)
  id: string;

  @Field(() => QuizQuestionType)
  @IsEnum(QuizQuestionType)
  questionType: QuizQuestionType;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  prompt?: string;

  @Field(() => [Choice], { nullable: true })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Choice)
  @IsOptional()
  choices?: Choice[];

  @Field(() => [Interaction], { nullable: true })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Interaction)
  @IsOptional()
  interactions?: Interaction[];

  @Field(() => MatchingInteraction, { nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => MatchingInteraction)
  matchingInteraction?: MatchingInteraction;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  answers?: string[];
}

@ObjectType()
export class QuizResult {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  userId: string;

  @Field(() => ID)
  quizId: string;

  @Field(() => ID)
  courseId: string;

  @Field(() => ID, { nullable: true })
  lessonId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  subtopicId?: string;

  @Field(() => Int)
  @IsNumber()
  correctAnswers: number;

  @Field(() => Int)
  @IsOptional()
  totalPercents?: number;

  @Field(() => Int)
  @IsNumber()
  wrongAnswers: number;

  @Field(() => [UserAnswer])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UserAnswer)
  userAnswers: [UserAnswer];
}

@ObjectType()
export class Quiz extends BaseEntity {
  @Field(() => String)
  @IsString()
  name: string;

  @Field(() => String)
  @IsString()
  @IsOptional()
  description?: string;

  @Field(() => [Question])
  @ValidateNested({ each: true })
  @Type(() => Question)
  questions: Question[];

  @Field(() => QuizResult, { nullable: true })
  quizResult: QuizResult;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  subtopicId?: string;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  isCompleted?: boolean;

  @Field(() => ID)
  @IsUUID()
  courseId: string;
}

@ObjectType()
class UserAnswer {
  @Field(() => ID)
  questionId: string;

  @Field(() => [[String]])
  selectedAnswer: string[][];

  @Field(() => Boolean)
  isCorrect: boolean;
}
