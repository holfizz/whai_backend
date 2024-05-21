import { Field, ID, InputType, PartialType } from "@nestjs/graphql";
import { IsOptional, IsUUID } from "class-validator";
import { CreateCoursePlanInput } from "./create-coursePlan.input";

@InputType()
export class UpdateCoursePlanInput extends PartialType(CreateCoursePlanInput) {
  @Field(() => ID, { nullable: true })
  @IsUUID()
  @IsOptional()
  id?: string;
}
