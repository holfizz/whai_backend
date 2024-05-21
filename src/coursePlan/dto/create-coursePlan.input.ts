import { Field, InputType } from "@nestjs/graphql";
import { IsOptional, IsString } from "class-validator";
@InputType()
export class CoursePlanInput {
  @Field(() => String)
  @IsString()
  title: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  description?: string;
}
