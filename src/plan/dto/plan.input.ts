import { Field, ID, InputType, registerEnumType } from "@nestjs/graphql";
import { IconType } from "@prisma/client";
import { Type } from "class-transformer";
import { ArrayNotEmpty, IsArray, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, ValidateNested } from "class-validator";

registerEnumType(IconType, {
  name: "IconType",
});
@InputType()
export class QuizPlanInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  title: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  description?: string;
}

@InputType()
export class LessonPlanInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  title: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => [IconType])
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(IconType, { each: true })
  icons: IconType[];

  @Field(() => ID)
  @IsUUID()
  subtopicId: string;

  @Field(() => ID)
  @IsUUID()
  courseId: string;
}

@InputType()
export class SubtopicPlanInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  title: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => ID)
  @IsUUID()
  topicId: string;

  @Field(() => [LessonPlanInput])
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => LessonPlanInput)
  LessonPlans: LessonPlanInput[];

  @Field(() => QuizPlanInput, { nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => QuizPlanInput)
  QuizPlan?: QuizPlanInput;
}

@InputType()
export class TopicPlanInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  title: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => ID)
  @IsUUID()
  courseId: string;

  @Field(() => [SubtopicPlanInput])
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => SubtopicPlanInput)
  SubtopicPlans: SubtopicPlanInput[];
}

@InputType()
export class PlanInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  title: string;

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
  TopicPlans: TopicPlanInput[];

  @Field(() => ID, { nullable: true })
  @IsUUID()
  @IsOptional()
  chatWithAIId?: string;
}
@InputType()
export class PlanWithAIInput {
  @IsString()
  @Field(() => ID)
  @IsUUID()
  chatWithAIId: string;

  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  content: string;

  @Field(() => ID)
  @IsUUID()
  courseId: string;
}
