import { BaseEntity } from "@/helpers/base.entity";
import { Field, ObjectType, registerEnumType } from "@nestjs/graphql";
import { IconType } from "@prisma/client";
import { Type } from "class-transformer";
import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString, ValidateNested } from "class-validator";

registerEnumType(IconType, {
  name: "IconType",
});

@ObjectType()
class QuizPlan extends BaseEntity {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  title: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  description?: string;
}

@ObjectType()
class LessonPlan extends BaseEntity {
  @Field(() => String)
  @IsString()
  title: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => [IconType])
  @IsEnum(IconType, { each: true })
  icons: IconType[];
}

@ObjectType()
class SubtopicPlan extends BaseEntity {
  @Field(() => String)
  @IsString()
  title: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => [LessonPlan])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LessonPlan)
  LessonPlans: LessonPlan[];

  @Field(() => QuizPlan, { nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => QuizPlan)
  QuizPlan?: QuizPlan;
}

@ObjectType()
class TopicPlan extends BaseEntity {
  @Field(() => String)
  @IsString()
  title: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => [SubtopicPlan])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubtopicPlan)
  SubtopicPlans: SubtopicPlan[];
}

@ObjectType()
export class Plan extends BaseEntity {
  @Field(() => String)
  @IsString()
  title: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => [TopicPlan])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TopicPlan)
  TopicPlans: TopicPlan[];
}
