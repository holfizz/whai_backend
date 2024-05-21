import { Field, ID, InputType, PartialType } from "@nestjs/graphql";
import { IsOptional, IsUUID } from "class-validator";
import { CoursePlanInput } from "./create-coursePlan.input";

@InputType()
export class UpdateCoursePlanInput extends PartialType(CoursePlanInput) {
  @Field(() => ID, { nullable: true })
  @IsUUID()
  @IsOptional()
  id?: string;
}
