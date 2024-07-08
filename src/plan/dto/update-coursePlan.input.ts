import { Field, ID, InputType, PartialType } from "@nestjs/graphql";
import { IsOptional, IsUUID } from "class-validator";
import { CoursePlanInput } from "./plan.input";

@InputType()
export class UpdatePlanInput extends PartialType(CoursePlanInput) {
  @Field(() => ID, { nullable: true })
  @IsUUID()
  @IsOptional()
  id?: string;
}
