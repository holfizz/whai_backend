import { BaseEntity } from "@/helpers/base.entity";
import { Field, Float, ID, ObjectType, registerEnumType } from "@nestjs/graphql";
import { SubscriptionType } from "@prisma/client";
import { IsBoolean, IsNumber, IsOptional, IsUUID } from "class-validator";

// Register the enum type for GraphQL
registerEnumType(SubscriptionType, {
  name: "SubscriptionType",
});

@ObjectType()
export class SubscriptionEntity extends BaseEntity {
  @Field(() => SubscriptionType)
  @IsOptional()
  type: SubscriptionType;

  @Field(() => Float)
  @IsOptional()
  @IsNumber()
  price?: number;

  @Field(() => Float)
  @IsOptional()
  @IsNumber()
  annualDiscountRate?: number;

  @Field(() => Float)
  @IsOptional()
  @IsNumber()
  courseLimitPerMonth?: number;

  @Field(() => Float)
  @IsOptional()
  @IsNumber()
  lessonLimitPerCourse?: number;

  @Field(() => Float)
  @IsOptional()
  @IsNumber()
  additionalTitlesLimit?: number;

  @Field(() => Boolean)
  @IsOptional()
  @IsBoolean()
  hasBasicAnalytics?: boolean;

  @Field(() => Boolean)
  @IsOptional()
  @IsBoolean()
  hasAIAssistedHomework?: boolean;

  @Field(() => Boolean)
  @IsOptional()
  @IsBoolean()
  hasFileUploadInChat?: boolean;

  @Field(() => Boolean)
  @IsOptional()
  @IsBoolean()
  hasImageGeneration?: boolean;

  @Field(() => Boolean)
  @IsOptional()
  @IsBoolean()
  isAutoRenewal?: boolean;
}
@ObjectType()
export class ActivatedSubscriptionResponse {
  @Field(() => ID)
  @IsUUID()
  userId: string;

  @Field(() => SubscriptionType)
  subscriptionType: SubscriptionType;

  @Field()
  subscriptionEndDate: Date;
}
