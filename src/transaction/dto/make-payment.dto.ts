import { Field, InputType } from "@nestjs/graphql";
import { IsNumber } from "class-validator";

@InputType()
export class MakePaymentDto {
  @Field(() => Number)
  @IsNumber()
  months: number;
}
