import { LessonBlockInput } from "@/lesson-block/dto/lesson-block.input";
import { LessonTasksInput } from "@/lesson-tasks/dto/lesson-task.input";
import { Field, ID, InputType, Int, registerEnumType } from "@nestjs/graphql";
import { LessonTypeEnum } from "@prisma/client";
import { Type } from "class-transformer";
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, ValidateNested } from "class-validator";

registerEnumType(LessonTypeEnum, {
  name: "LessonTypeEnum",
});

@InputType()
export class LessonInput {
  @Field(() => String)
  @IsString()
  name: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => ID)
  @IsUUID()
  courseId: string;

  @Field(() => ID)
  @IsString()
  @IsUUID()
  subtopicId: string;

  @Field(() => [LessonTypeEnum], { nullable: true })
  @IsOptional()
  types?: LessonTypeEnum[];
}

@InputType()
export class LessonWithAITasksBlocksInput extends LessonInput {
  @Field(() => [LessonBlockInput], { nullable: "itemsAndList" })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => LessonBlockInput)
  lessonBlocks?: LessonBlockInput[];

  @Field(() => [LessonTasksInput], { nullable: "itemsAndList" })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => LessonTasksInput)
  lessonTasks?: LessonTasksInput[];

  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  completionTime?: number;

  @Field(() => ID, { nullable: true })
  @IsUUID()
  @IsOptional()
  id?: string;
}

@InputType()
export class LessonWithAIInput {
  @Field(() => ID, { nullable: true })
  @IsUUID()
  @IsOptional()
  id?: string;

  @IsString()
  @Field(() => ID)
  @IsUUID()
  courseAIHistoryId: string;

  @Field(() => ID)
  @IsUUID()
  courseId: string;

  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  additionalParams?: string;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  isHasVideo?: boolean;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  isHasAISearchImage?: boolean;

  @IsString()
  @Field(() => ID)
  @IsUUID()
  subtopicId: string;

  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  completionTime?: number;
}
