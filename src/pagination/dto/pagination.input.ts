import { Field, InputType } from "@nestjs/graphql";
import { IsOptional, IsString } from "class-validator";

@InputType()
export class PaginationInput {
  @IsOptional()
  @IsString()
  @Field(() => String)
  page?: string;

  @IsOptional()
  @IsString()
  @Field(() => String)
  perPage?: string;
}
