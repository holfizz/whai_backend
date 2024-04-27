import { Field, ID, Int, ObjectType, registerEnumType } from "@nestjs/graphql";
import { LessonBlockEnum, LessonTypeEnum } from "@prisma/client";
import { Type } from "class-transformer";
import { IsArray, IsBoolean, IsEnum, IsInt, IsOptional, IsString, IsUUID, ValidateNested } from "class-validator";

@ObjectType()
export class LessonTaskInput {
  @Field()
  @IsString()
  name: string;

  @Field()
  @IsBoolean()
  isChecked: boolean;
}

registerEnumType(LessonBlockEnum, {
  name: "LessonBlockEnum",
});

@ObjectType()
export class LessonBlock {
  @Field(() => LessonBlockEnum)
  @IsEnum(LessonBlockEnum)
  type: LessonBlockEnum;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  code?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  text?: string;

  @Field({ nullable: true })
  @IsOptional()
  videoUrl?: string;

  @Field({ nullable: true })
  @IsOptional()
  imageUrl?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  document?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  duration?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  caption?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  language?: string;

  @Field(() => ID)
  @IsUUID()
  lessonId: string;
}

registerEnumType(LessonTypeEnum, {
  name: "LessonTypeEnum",
});

@ObjectType()
export class Lesson {
  @Field(() => ID)
  @IsUUID()
  id: string;

  @Field()
  @IsString()
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => [LessonTypeEnum])
  @IsArray()
  types: LessonTypeEnum[];

  @Field(() => [LessonBlock], { nullable: "itemsAndList" })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => LessonBlock)
  lessonBlocks?: LessonBlock[];

  @Field(() => [LessonTaskInput], { nullable: "itemsAndList" })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => LessonTaskInput)
  tasks?: LessonTaskInput[];
}
