import { CourseAIHistory } from "@/couse-ai-history/entities/course_ai_history.entity";
import { BaseEntity } from "@/helpers/base.entity";
import { Field, Float, ObjectType, registerEnumType } from "@nestjs/graphql";
import { CourseLevelEnum } from "@prisma/client";
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, IsUrl } from "class-validator";

registerEnumType(CourseLevelEnum, {
  name: "CourseLevelEnum",
});

@ObjectType()
export class Course extends BaseEntity {
  @Field(() => String)
  @IsString()
  name: string;

  @Field(() => CourseAIHistory, { nullable: true })
  @IsOptional()
  courseAIHistory?: CourseAIHistory;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUrl()
  imgUrl?: string;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  isTrial?: boolean;

  @Field(() => String, { nullable: true })
  @IsOptional()
  publicUrl?: string;

  @Field(() => CourseLevelEnum, { nullable: true })
  @IsEnum(CourseLevelEnum)
  @IsOptional()
  level?: CourseLevelEnum;

  @Field(() => Float)
  @IsNumber()
  progressPercents: number;

  @Field(() => Number)
  @IsNumber()
  totalTopics: number;

  @Field(() => Number)
  @IsNumber()
  completionTime: number;
}
