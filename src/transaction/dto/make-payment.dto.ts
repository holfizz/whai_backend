import { Field, InputType, registerEnumType } from "@nestjs/graphql";
import { SubscriptionType } from "@prisma/client";
import { IsBoolean, IsNumber } from "class-validator";

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

  @Field(() => Boolean)
  @IsBoolean()
  isAutoRenewal: boolean;
}
