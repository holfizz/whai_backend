import { Field, ObjectType } from "@nestjs/graphql";
import { IsOptional, IsString } from "class-validator";

@ObjectType()
export class TinkoffPaymentResponse {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  paymentUrl?: string;
}
