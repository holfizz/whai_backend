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
export class ModulePlanInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  title: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

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

  @Field(() => [ModulePlanInput])
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ModulePlanInput)
  ModulePlans: ModulePlanInput[];

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

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  title: string;
}
