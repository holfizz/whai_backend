import { SubscriptionEntity } from "@/subscription/entities/subscription.entity";
import { Field, InputType, registerEnumType } from "@nestjs/graphql";
import { SubscriptionType } from "@prisma/client";
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from "class-validator";
registerEnumType(SubscriptionType, {
  name: "SubscriptionType",
});
@InputType()
export class TinkoffPaymentDto {
  @Field(() => SubscriptionType)
  @IsNotEmpty()
  subType: SubscriptionType;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  Descriptions?: string;

  @Field(() => String)
  @IsUUID()
  userId: string;
}

@InputType()
export class TinkoffItemDto {
  @Field()
  @IsNotEmpty()
  description: string; // Описание товара

  @Field()
  @IsNotEmpty()
  quantity: number; // Количество товара (изменено на number)

  // @Field(() => AmountPayment)
  // @ValidateNested()
  // amount: AmountPayment; // Сумма товара

  @Field()
  @IsNotEmpty()
  vat_code: string; // Код налога на товар

  @Field()
  @IsNotEmpty()
  price: number; // Цена товара (добавлено)
}

@InputType()
export class TinkoffRequestDto {
  @Field(() => Number)
  @IsNumber()
  Amount: number;

  @Field(() => String)
  @IsUUID()
  OrderId: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  Descriptions?: string;

  @Field(() => String)
  @IsUUID()
  userId: string;

  @Field(() => SubscriptionEntity)
  @IsNotEmpty()
  subs: SubscriptionEntity;
}
