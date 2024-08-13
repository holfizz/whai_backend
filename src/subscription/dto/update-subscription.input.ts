import { Field, ID, InputType, PartialType } from "@nestjs/graphql";
import { IsOptional, IsUUID } from "class-validator";
import { SubscriptionInput } from "./create-subscription.input";

@InputType()
export class UpdateSubscriptionInput extends PartialType(SubscriptionInput) {
  @Field(() => ID, { nullable: true })
  @IsUUID()
  @IsOptional()
  id?: string;
}
