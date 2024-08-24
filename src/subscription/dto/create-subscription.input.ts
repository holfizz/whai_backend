import { Field, Float, InputType, registerEnumType } from "@nestjs/graphql";
import { SubscriptionType } from "@prisma/client";
import { IsBoolean, IsNumber } from "class-validator";

registerEnumType(SubscriptionType, {
  name: "SubscriptionType",
});

@InputType()
export class SubscriptionInput {
  @Field(() => SubscriptionType)
  type: SubscriptionType;

  @Field(() => Float)
  @IsNumber()
  price: number;

  @Field(() => Float)
  @IsNumber()
  annualDiscountRate: number;

  @Field(() => Float)
  @IsNumber()
  courseLimitPerMonth: number;

  @Field(() => Float)
  @IsNumber()
  lessonLimitPerCourse: number;

  @Field(() => Float)
  @IsNumber()
  additionalTitlesLimit: number;

  @Field(() => Boolean)
  @IsBoolean()
  isAutoRenewal: boolean;

  @Field(() => Boolean)
  @IsBoolean()
  hasBasicAnalytics: boolean;

  @Field(() => Boolean)
  @IsBoolean()
  hasAIAssistedHomework: boolean;

  @Field(() => Boolean)
  @IsBoolean()
  hasFileUploadInChat: boolean;

  @Field(() => Boolean)
  @IsBoolean()
  hasImageGeneration: boolean;
}

export class ActivateDto {
  subscriptionType: SubscriptionType;
  transactionId: string;
  months: number;
  paymentId: string;
}
