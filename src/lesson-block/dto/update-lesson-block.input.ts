import { Field, ID, InputType, PartialType } from "@nestjs/graphql";
import { IsOptional, IsUUID } from "class-validator";
import { LessonBlockInput } from "./lesson-block.input";

@InputType()
export class UpdateLessonBlock extends PartialType(LessonBlockInput) {
  @Field(() => ID, { nullable: true })
  @IsUUID()
  @IsOptional()
  id?: string;
}
