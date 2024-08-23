import { Field, InputType } from "@nestjs/graphql";
import { IsNumber, IsUUID } from "class-validator";

@InputType()
export class CreateTransactionDto {
  @Field(() => Number)
  @IsNumber()
  months: number;

  @Field(() => String)
  @IsUUID()
  userId: string;
}
