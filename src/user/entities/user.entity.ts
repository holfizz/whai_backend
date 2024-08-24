import { Field, ID, ObjectType, registerEnumType } from "@nestjs/graphql";
import { SubscriptionType, UserRole } from "@prisma/client";
import { IsOptional, IsUUID } from "class-validator";
registerEnumType(UserRole, {
  name: "UserRole",
});
registerEnumType(SubscriptionType, {
  name: "SubscriptionType",
});

@ObjectType()
export class ActiveSubscription {
  @Field(type => SubscriptionType)
  type: SubscriptionType;

  @Field(type => Number)
  price: number;

  @Field(type => String)
  startedAt: Date;

  @Field(type => String, { nullable: true })
  endedAt?: Date;

  @Field(type => Boolean)
  isActive: boolean;

  @Field(type => Number, { nullable: true })
  annualDiscountRate?: number;

  @Field(type => Number, { nullable: true })
  courseLimitPerMonth?: number;

  @Field(type => Number, { nullable: true })
  lessonLimitPerCourse?: number;

  @Field(type => Number, { nullable: true })
  additionalTitlesLimit?: number;

  @Field(type => Boolean, { nullable: true })
  hasBasicAnalytics?: boolean;

  @Field(type => Boolean, { nullable: true })
  hasAIAssistedHomework?: boolean;

  @Field(type => Boolean, { nullable: true })
  hasFileUploadInChat?: boolean;

  @Field(type => Boolean, { nullable: true })
  hasImageGeneration?: boolean;
}

@ObjectType()
export class User {
  @Field(type => ID)
  @IsUUID()
  id: string;

  @Field(type => String)
  createdAt: Date;

  @Field(type => String)
  updatedAt: Date;

  @Field(type => String)
  firstName: string;

  @Field(type => String)
  lastName: string;

  @Field(type => String)
  phoneNumber: string;

  @Field({ nullable: true })
  avatarPath?: string;

  @Field(type => String)
  email: string;

  @Field(type => [UserRole])
  roles: UserRole[];

  @Field(type => Boolean)
  isVerified: boolean;

  @Field({ nullable: true })
  resetPasswordToken?: string;

  @Field({ nullable: true })
  resetPasswordExpiration?: Date;

  @Field(() => ActiveSubscription, { nullable: true })
  @IsOptional()
  activeSubscription?: ActiveSubscription;
}
