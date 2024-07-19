import { Field, InputType, Int } from "@nestjs/graphql";
import { IsInt, IsOptional, Min } from "class-validator";

@InputType()
export class PaginationInput {
  @IsOptional()
  @IsInt()
  @Min(0)
  @Field(() => Int, { defaultValue: 0 })
  skip?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Field(() => Int, { defaultValue: 30 })
  take?: number;
}
