import { BaseEntity } from "@/helpers/base.entity";
import { Field, Float, ID, Int, ObjectType, registerEnumType } from "@nestjs/graphql";
import { QuizQuestionType } from "@prisma/client";
import { Type } from "class-transformer";
import { IsArray, IsEnum, IsOptional, IsString, IsUUID, ValidateNested } from "class-validator";

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

  @Field(() => ID, { nullable: true })
  @IsOptional()
  courseId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  subtopicId?: string;

  @Field(() => Float)
  @IsOptional()
  totalPercents?: number;

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

  @Field(() => [QuizResult], { nullable: true })
  quizResult?: QuizResult[];

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
export class MatchingAnswer {
  @Field(() => String)
  left: string;

  @Field(() => String)
  right: string;
}

@ObjectType()
export class UserAnswer {
  @Field(() => ID)
  questionId: string;

  @Field(() => [MatchingAnswer], { nullable: true })
  @IsOptional()
  @IsArray()
  matchingAnswers?: MatchingAnswer[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  selectedAnswers?: string[];

  @Field(() => Float)
  correctnessPercentage: number;

  @Field(() => [String])
  correctAnswers: string[];
}

@ObjectType()
export class QuizDetails {
  @Field(() => ID)
  id: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsOptional()
  subtopicId?: string;

  @Field(() => ID, { nullable: true })
  @IsUUID()
  @IsOptional()
  courseId?: string;

  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => [Question])
  questions: Question[];

  @Field(() => QuizResult, { nullable: true })
  quizResult?: QuizResult;
}

@ObjectType()
export class QuizSummary {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => Float, { nullable: true })
  totalPercents?: number;
}
