import { Field, ID, InputType, PartialType } from "@nestjs/graphql";
import { IsOptional, IsUUID } from "class-validator";
import { LessonInput } from "./lesson.input";

@InputType()
export class UpdateLesson extends PartialType(LessonInput) {
  @Field(() => ID, { nullable: true })
  @IsUUID()
  @IsOptional()
  id?: string;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  isCompleted?: boolean;
}
