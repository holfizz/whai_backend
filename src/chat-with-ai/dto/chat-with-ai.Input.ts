import { Field, InputType } from "@nestjs/graphql";
import { IsString } from "class-validator";

@InputType()
export class ChatWithAIInput {
  @IsString()
  @Field(() => String, { nullable: true })
  title?: string;
}
