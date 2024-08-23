import { Field, InputType } from "@nestjs/graphql";
import { IsNumber, IsOptional, IsUUID } from "class-validator";

@InputType()
export class CreateTransactionDto {
  @Field(() => Number)
  @IsNumber()
  months: number;

  @Field(() => String)
  @IsUUID()
  userId: string;

  @Field(() => Object, { nullable: true })
  @IsOptional()
  payment?: {
    amount: {
      value: string;
      currency: string;
    };

    status: string;
    payment_method?: {
      type: string;
    };
  };
}
