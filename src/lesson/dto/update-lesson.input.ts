import { Field, ID, InputType, ObjectType, registerEnumType } from "@nestjs/graphql";
import { LessonTypeEnum } from "@prisma/client";
import { IsBoolean, IsOptional, IsString, IsUUID } from "class-validator";

registerEnumType(LessonTypeEnum, {
  name: "LessonTypeEnum",
});

@InputType()
export class UpdateLesson {
  @Field(() => ID, { nullable: true })
  @IsUUID()
  @IsOptional()
  id?: string;

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  isCompleted?: boolean;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  courseId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsString()
  @IsUUID()
  subtopicId?: string;

  @Field(() => [LessonTypeEnum], { nullable: "itemsAndList" })
  @IsOptional()
  types?: LessonTypeEnum[];
}

@ObjectType()
export class UpdateLessonEntities {
  @Field(() => ID, { nullable: true })
  @IsUUID()
  @IsOptional()
  id?: string;

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  isCompleted?: boolean;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  courseId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsString()
  @IsUUID()
  subtopicId?: string;

  @Field(() => [LessonTypeEnum], { nullable: "itemsAndList" })
  @IsOptional()
  types?: LessonTypeEnum[];
}
