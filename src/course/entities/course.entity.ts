import { BaseEntity } from "@/helpers/base.entity";
import { Field, Float, ObjectType, registerEnumType } from "@nestjs/graphql";
import { CourseLevelEnum } from "@prisma/client";
import { IsEnum, IsNumber, IsOptional, IsString, IsUrl } from "class-validator";
import { CourseAIHistory } from "@/couse-ai-history/entities/course_ai_history.entity";

registerEnumType(CourseLevelEnum, {
  name: "CourseLevelEnum",
});

@ObjectType()
export class Course extends BaseEntity {
  @Field()
  @IsString()
  name: string;

  @Field(() => CourseAIHistory, { nullable: true })
  @IsOptional()
  courseAIHistory?: CourseAIHistory;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @Field({ nullable: true })
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
