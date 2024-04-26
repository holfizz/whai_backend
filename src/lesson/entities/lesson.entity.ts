import { Field, ID, ObjectType, registerEnumType } from "@nestjs/graphql";
import { Type } from "class-transformer";
import { IsArray, IsOptional, IsString, IsUUID, ValidateNested } from "class-validator";
import { LessonBlockInput, LessonTaskInput } from "../dto/lesson.input";

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

  @Field(() => [LessonBlockInput], { nullable: "itemsAndList" })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => LessonBlockInput)
  lessonBlocks?: LessonBlockInput[];

  @Field(() => [LessonTaskInput], { nullable: "itemsAndList" })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => LessonTaskInput)
  tasks?: LessonTaskInput[];
}
