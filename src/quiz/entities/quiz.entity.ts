import { BaseEntity } from "@/helpers/base.entity";
import { Field, ID, ObjectType, registerEnumType } from "@nestjs/graphql";
import { QuizQuestionType } from "@prisma/client";
import { Type } from "class-transformer";
import { IsArray, IsEnum, IsJSON, IsOptional, IsString, IsUUID, ValidateNested } from "class-validator";
import GraphQLJSON from "graphql-type-json";

registerEnumType(QuizQuestionType, {
  name: "QuizQuestionType",
});

@ObjectType()
export class Choice {
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

@ObjectType()
export class Interaction {
  @Field(() => [String])
  answers: string[];

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  quizId?: string;

  @Field(() => String)
  @IsString()
  placeholder: string;

  @Field(() => [Choice])
  @ValidateNested({ each: true })
  @Type(() => Choice)
  choices: Choice[];
}

@ObjectType()
export class MatchingInteraction {
  @Field(() => GraphQLJSON)
  @IsJSON()
  left: object;

  @Field(() => GraphQLJSON)
  @IsJSON()
  right: object;

  @Field(() => [String])
  answers: string[];
}

@ObjectType()
export class Quiz extends BaseEntity {
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

  @Field(() => [Choice])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Choice)
  choices: Choice[];

  @Field(() => [Interaction])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Interaction)
  interactions: Interaction[];

  @Field(() => MatchingInteraction, { nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => MatchingInteraction)
  matchingInteraction?: MatchingInteraction;

  @Field(() => String)
  @IsString()
  prompt: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  answers?: string[];

  @Field(() => [GraphQLJSON], { nullable: true })
  @IsOptional()
  @IsJSON()
  pairs?: object[];

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  instructions?: string;
}

// export interface Question {
//   id: string;
//   title: string;
//   category: string;
//   stimulus?: string;
//   prompt: string;
//   answers: string[][];
//   choices?: Choice[];
//   points: number;
//   metadata?: Metadata;
//   interactions?: Interaction[];
//   matching_interaction?: MatchingInteraction;
// }

// export interface Choice {
//   id: string;
//   content: string;
// }

// export interface Metadata {
//   Type: string;
//   Difficulty: string;
//   category: string;
// }

// export interface Interaction {
//   category: string;
//   placeholder: string;
//   choices?: Choice2[];
//   answers: string[];
// }

// export interface Choice2 {
//   id: string;
//   content: string;
// }

// export interface MatchingInteraction {
//   left: Left[];
//   right: Right[];
//   answers: string[][];
// }

// export interface Left {
//   id: string;
//   content: string;
// }

// export interface Right {
//   id: string;
//   content: string;
// }
