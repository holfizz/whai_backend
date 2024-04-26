import { Field, ID, InputType, PartialType } from "@nestjs/graphql";
import { IsOptional, IsUUID } from "class-validator";
import { LessonBlockInput, LessonInput, LessonTaskInput } from "./lesson.input";

@InputType()
export class UpdateLesson extends PartialType(LessonInput) {
  @Field(() => ID)
  @IsUUID()
  @IsOptional()
  id?: string;
}

@InputType()
export class UpdateLessonBlock extends PartialType(LessonBlockInput) {
  @Field(() => ID)
  @IsUUID()
  @IsOptional()
  id?: string;
}

@InputType()
export class UpdateLessonTask extends PartialType(LessonTaskInput) {
  @Field(() => ID)
  @IsUUID()
  @IsOptional()
  id?: string;
}
