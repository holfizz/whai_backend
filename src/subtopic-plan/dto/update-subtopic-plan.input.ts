import { Field, ID, InputType, PartialType } from "@nestjs/graphql";
import { IsOptional, IsUUID } from "class-validator";
import { CreateSubtopicPlanInput } from "./create-subtopic-plan.input";

@InputType()
export class UpdateSubtopicPlanInput extends PartialType(CreateSubtopicPlanInput) {
  @Field(() => ID, { nullable: true })
  @IsUUID()
  @IsOptional()
  id?: string;
}
