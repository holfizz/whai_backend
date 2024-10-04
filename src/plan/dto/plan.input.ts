import { Field, ID, InputType, registerEnumType } from "@nestjs/graphql";
import { LessonTypeEnum } from "@prisma/client";
import { Type } from "class-transformer";
import { ArrayNotEmpty, IsArray, IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, ValidateNested } from "class-validator";

registerEnumType(LessonTypeEnum, {
  name: "LessonTypeEnum",
});

@InputType()
export class QuizPlanInput {
  @Field(() => ID, { nullable: true })
  @IsString()
  @IsOptional()
  id?: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  name: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  description?: string;

  @Field(() => ID, { nullable: true })
  @IsUUID()
  @IsOptional()
  @IsUUID()
  subtopicId?: string;

  @Field(() => ID, { nullable: true })
  @IsUUID()
  @IsOptional()
  @IsUUID()
  courseId?: string;
}

@InputType()
export class LessonPlanInput {
  @Field(() => ID, { nullable: true })
  @IsString()
  @IsOptional()
  id?: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  name: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => [LessonTypeEnum])
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(LessonTypeEnum, { each: true })
  types: LessonTypeEnum[];

  @Field(() => ID, { nullable: true })
  @IsUUID()
  @IsOptional()
  @IsUUID()
  subtopicId?: string;

  @Field(() => ID, { nullable: true })
  @IsUUID()
  @IsOptional()
  @IsUUID()
  courseId?: string;
}

@InputType()
export class SubtopicPlanInput {
  @Field(() => ID, { nullable: true })
  @IsString()
  @IsOptional()
  id?: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  name: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  topicId?: string;

  @Field(() => [LessonPlanInput], { nullable: true })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => LessonPlanInput)
  @IsOptional()
  lessons?: LessonPlanInput[];

  @Field(() => [QuizPlanInput], { nullable: true })
  @IsOptional()
  @ValidateNested()
  @IsArray()
  @Type(() => QuizPlanInput)
  quizzes?: QuizPlanInput[];

  @Field(() => Number)
  @IsNumber()
  completionTime: number;
}

@InputType()
export class TopicPlanInput {
  @Field(() => ID, { nullable: true })
  @IsString()
  @IsOptional()
  id?: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  name: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => ID, { nullable: true })
  @IsUUID()
  @IsOptional()
  @IsUUID()
  courseId?: string;

  @Field(() => [SubtopicPlanInput], { nullable: true })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @IsOptional()
  @Type(() => SubtopicPlanInput)
  subtopics?: SubtopicPlanInput[];

  @Field(() => Number)
  @IsNumber()
  completionTime: number;
}

@InputType()
export class CoursePlanInput {
  @Field(() => ID, { nullable: true })
  @IsString()
  @IsOptional()
  id?: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  name: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => ID)
  @IsUUID()
  courseId: string;

  @Field(() => [TopicPlanInput])
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => TopicPlanInput)
  topics: TopicPlanInput[];
}

@InputType()
export class CoursePlanWithAIInput {
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
  @Field(() => ID, { nullable: true })
  @IsUUID()
  @IsOptional()
  courseAIHistoryId?: string;

  @Field(() => ID)
  @IsUUID()
  courseId: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  userKnowledge?: string;

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  isHasVideo?: boolean;
}
