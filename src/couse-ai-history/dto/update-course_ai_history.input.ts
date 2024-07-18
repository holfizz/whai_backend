import { Field, ID, InputType, PartialType } from "@nestjs/graphql";
import { IsOptional, IsUUID } from "class-validator";
import { CourseAIHistoryInput } from "../dto/course_ai_history.Input";

@InputType()
export class UpdateCourseAiHistoryInput extends PartialType(CourseAIHistoryInput) {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  id?: string;
}
