import { BaseEntity } from "@/helpers/base.entity";
import { Field, ID, Int, ObjectType, registerEnumType } from "@nestjs/graphql";
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
  id: string;

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
  @IsOptional()
  @IsString()
  stimulus?: string;

  @Field(() => String)
  @IsString()
  prompt: string;

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
export class Quiz extends BaseEntity {
  @Field(() => String)
  @IsString()
  title: string;

  @Field(() => [Question])
  @ValidateNested({ each: true })
  @Type(() => Question)
  questions: Question[];

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  lessonBlockId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  folderId?: string;

  @Field(() => Int)
  @IsOptional()
  totalQuestions?: number;
}
@ObjectType()
class UserAnswer {
  @Field(() => ID)
  questionId: string;

  @Field(() => [String])
  selectedAnswer: string[];

  @Field(() => Boolean)
  isCorrect: boolean;
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
  courseId?: string;

  @Field(() => ID, { nullable: true })
  lessonId?: string;

  @Field(() => Int)
  totalQuestions: number;

  @Field(() => Int)
  correctAnswers: number;

  @Field(() => Int)
  wrongAnswers: number;

  @Field(() => Int)
  completionTime: number;

  @Field(() => [UserAnswer])
  userAnswers: UserAnswer[];
}
