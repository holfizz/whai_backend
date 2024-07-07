import { Field, InputType } from "@nestjs/graphql";
import { IsOptional, IsString } from "class-validator";

@InputType()
export class ChatWithAIInput {
  @IsString()
  @Field(() => String, { nullable: true })
  @IsOptional()
  title?: string;
}
