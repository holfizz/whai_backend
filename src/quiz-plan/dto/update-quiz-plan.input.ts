import { Field, ID, InputType, PartialType } from "@nestjs/graphql";
import { IsOptional, IsUUID } from "class-validator";
import { CreateQuizPlanInput } from "./create-quiz-plan.input";

@InputType()
export class UpdateQuizPlanInput extends PartialType(CreateQuizPlanInput) {
  @Field(() => ID, { nullable: true })
  @IsUUID()
  @IsOptional()
  id?: string;
}
