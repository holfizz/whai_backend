import { InputType } from "@nestjs/graphql";
import { IsString } from "class-validator";
import { CreateTransactionDto } from "./create-transaction.dto";

@InputType()
export class UpdateTransactionDto extends CreateTransactionDto {
  @IsString()
  transactionId: string;
}
