import { Field, InputType, registerEnumType } from "@nestjs/graphql";
import { SubscriptionType } from "@prisma/client";
import { IsNumber } from "class-validator";

registerEnumType(SubscriptionType, {
  name: "SubscriptionType",
});

@InputType()
export class MakePaymentDto {
  @Field(() => Number)
  @IsNumber()
  months: number;

  @Field(() => SubscriptionType)
  subscriptionType: SubscriptionType;
}
