import { Field, ID, InputType, PartialType } from "@nestjs/graphql";
import { IsOptional, IsUUID } from "class-validator";
import { LessonTasksInput } from "./lesson-task.input";

@InputType()
export class UpdateLessonTasks extends PartialType(LessonTasksInput) {
  @Field(() => ID, { nullable: true })
  @IsUUID()
  @IsOptional()
  id?: string;
}
