import { Field, InputType } from "@nestjs/graphql";
import { IsNumber } from "class-validator";

@InputType()
export class CreateTransactionDto {
  @Field(() => Number)
  @IsNumber()
  months: number;
}
