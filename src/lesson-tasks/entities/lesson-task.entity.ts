import { BaseEntity } from "@/helpers/base.entity";
import { Field, ID, Int, ObjectType } from "@nestjs/graphql";
import { IsArray, IsBoolean, IsInt, IsOptional, IsString, IsUUID } from "class-validator";

@ObjectType()
export class LessonTasks extends BaseEntity {
  @Field(() => String)
  @IsString()
  name: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field(() => Boolean)
  @IsBoolean()
  isChecked: boolean;

  @Field(() => ID)
  @IsUUID()
  lessonId: string;
}

@ObjectType()
export class LessonHomeworkResponse {
  @Field(() => String)
  @IsString()
  status: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  reason?: string;

  @Field(() => String)
  @IsString()
  incorrectParts: string;

  @Field(() => String)
  @IsString()
  suggestions: string;

  @Field(() => Int)
  @IsInt()
  completionPercentage: number;

  @Field(() => String)
  @IsString()
  fileName: string;

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsOptional()
  links?: string[];
}
