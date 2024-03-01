import { Field, InputType } from "@nestjs/graphql";
import { IsOptional, IsString } from "class-validator";

@InputType()
export class CreateChatInput {
  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  title?: string;
}
