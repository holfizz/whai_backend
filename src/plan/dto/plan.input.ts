import { Field, InputType, registerEnumType } from "@nestjs/graphql";
import { IconType } from "@prisma/client";
import { Type } from "class-transformer";
import { ArrayNotEmpty, IsArray, IsEnum, IsNotEmpty, IsOptional, IsString, ValidateNested } from "class-validator";

registerEnumType(IconType, {
  name: "IconType",
});

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
}
