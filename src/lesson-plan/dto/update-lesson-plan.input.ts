import { Field, ID, InputType, PartialType } from "@nestjs/graphql";
import { IsOptional, IsUUID } from "class-validator";
import { CreateLessonPlanInput } from "./create-lesson-plan.input";

@InputType()
export class UpdateLessonPlanInput extends PartialType(CreateLessonPlanInput) {
  @Field(() => ID, { nullable: true })
  @IsUUID()
  @IsOptional()
  id?: string;
}
