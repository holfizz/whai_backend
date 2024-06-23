import { LessonBlockInput } from "@/lesson-block/dto/lesson-block.input";
import { LessonTasksInput } from "@/lesson-tasks/dto/lesson-task.input";
import { Field, ID, InputType, registerEnumType } from "@nestjs/graphql";
import { LessonTypeEnum } from "@prisma/client";
import { Type } from "class-transformer";
import { IsNotEmpty, IsOptional, IsString, IsUUID, ValidateNested } from "class-validator";

registerEnumType(LessonTypeEnum, {
  name: "LessonTypeEnum",
});

@InputType()
export class LessonInput {
  @Field(() => String)
  @IsString()
  name: string;

  @Field(() => ID)
  @IsString()
  @IsUUID()
  folderId: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => [LessonTypeEnum])
  types: LessonTypeEnum[];
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
}
@InputType()
export class LessonWithAIInput {
  @IsString()
  @Field(() => ID)
  @IsUUID()
  chatWithAIId: string;

  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  content: string;

  @IsString()
  @Field(() => ID)
  @IsUUID()
  folderId: string;
}
