import { Field, ID, InputType, PartialType } from "@nestjs/graphql";
import { IsOptional, IsUUID } from "class-validator";
import { LearningSessionInput } from "./analytics.input";

@InputType()
export class UpdateLearningSessionInput extends PartialType(LearningSessionInput) {
  @Field(() => ID)
  @IsOptional()
  @IsUUID()
  id: number;
}
