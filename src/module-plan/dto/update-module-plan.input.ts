import { Field, ID, InputType, PartialType } from "@nestjs/graphql";
import { IsOptional, IsUUID } from "class-validator";
import { CreateModulePlanInput } from "./create-module-plan.input";

@InputType()
export class UpdateModulePlanInput extends PartialType(CreateModulePlanInput) {
  @Field(() => ID, { nullable: true })
  @IsUUID()
  @IsOptional()
  id?: string;
}
