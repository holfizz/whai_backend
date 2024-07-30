import { BaseEntity } from "@/helpers/base.entity";
import { Field, ID, ObjectType, registerEnumType } from "@nestjs/graphql";
import { LessonTypeEnum } from "@prisma/client";
import { Type } from "class-transformer";
import { ArrayNotEmpty, IsArray, IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, ValidateNested } from "class-validator";

registerEnumType(LessonTypeEnum, {
  name: "LessonTypeEnum",
});

@ObjectType()
export class QuizzesPlan extends BaseEntity {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  name: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  description: string;

  @Field(() => ID)
  @IsUUID()
  subtopicId: string;

  @Field(() => ID)
  @IsUUID()
  courseId: string;

  @Field(() => Boolean)
  @IsBoolean()
  isPlan: boolean;
}

@ObjectType()
export class LessonPlan extends BaseEntity {
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

  @Field(() => ID)
  @IsUUID()
  subtopicId: string;

  @Field(() => ID)
  @IsUUID()
  courseId: string;
}

@ObjectType()
export class SubtopicPlan extends BaseEntity {
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
  topicId: string;

  @Field(() => [LessonPlan])
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => LessonPlan)
  lessons: LessonPlan[];

  @Field(() => [QuizzesPlan], { nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => QuizzesPlan)
  quizzes?: QuizzesPlan[];

  @Field(() => Number)
  @IsNumber()
  completionTime: number;
}

@ObjectType()
export class TopicPlan extends BaseEntity {
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

  @Field(() => [SubtopicPlan])
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => SubtopicPlan)
  subtopics: SubtopicPlan[];

  @Field(() => Number)
  @IsNumber()
  completionTime: number;
}

@ObjectType()
export class CoursePlan extends BaseEntity {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  name: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => [TopicPlan])
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => TopicPlan)
  topics: TopicPlan[];
}
