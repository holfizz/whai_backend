import { BaseEntity } from "@/helpers/base.entity";
import { Field, ID, ObjectType, registerEnumType } from "@nestjs/graphql";
import { QuizQuestionType } from "@prisma/client";
import { Type } from "class-transformer";
import { IsArray, IsEnum, IsJSON, IsOptional, IsString, IsUUID, ValidateNested } from "class-validator";

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
  @IsJSON()
  left: SideType[];

  @Field(() => [SideType])
  @IsJSON()
  right: SideType[];

  @Field(() => [[String]])
  answers: string[][] | string[];
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

  @Field(() => [Choice], { nullable: true })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Choice)
  @IsOptional()
  choices?: Choice[];

  @Field(() => [Interaction])
  @IsArray()
  @ValidateNested({ each: true })
  @IsOptional()
  @Type(() => Interaction)
  interactions?: Interaction[];

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

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  instructions?: string;
}
