import { Field, ID, InputType, PartialType } from "@nestjs/graphql";
import { IsOptional, IsUUID } from "class-validator";
import { CourseInput } from "./course.input";

@InputType()
export class UpdateCourse extends PartialType(CourseInput) {
  @Field(() => ID)
  @IsUUID()
  @IsOptional()
  id?: string;
}
