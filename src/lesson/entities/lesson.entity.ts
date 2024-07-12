import { BaseEntity } from "@/helpers/base.entity";
import { LessonBlock } from "@/lesson-block/entities/lesson-block.entity";
import { LessonTasks } from "@/lesson-tasks/entities/lesson-task.entity";
import { Field, ID, Int, ObjectType, registerEnumType } from "@nestjs/graphql";
import { LessonTypeEnum } from "@prisma/client";
import { Type } from "class-transformer";
import { IsBoolean, IsNumber, IsOptional, IsString, IsUUID, ValidateNested } from "class-validator";

registerEnumType(LessonTypeEnum, {
  name: "LessonTypeEnum",
});

@ObjectType()
export class Lesson extends BaseEntity {
  @Field()
  @IsString()
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => [LessonTypeEnum])
  types: LessonTypeEnum[];

  @Field(() => [LessonBlock], { nullable: "itemsAndList" })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => LessonBlock)
  lessonBlocks?: LessonBlock[];

  @Field(() => [LessonTasks], { nullable: "itemsAndList" })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => LessonTasks)
  lessonTasks?: LessonTasks[];

  @Field(() => ID)
  @IsString()
  @IsUUID()
  subtopicId: string;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  isCompleted?: boolean;

  @Field(() => Int)
  @IsNumber()
  completionTime: number;

  @Field(() => Boolean)
  @IsBoolean()
  isHasLessonTask: boolean;
}
