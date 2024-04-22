import { Field, InputType } from "@nestjs/graphql";
import { IsString } from "class-validator";

@InputType()
export class CreateMessageInput {
  @Field(() => String)
  @IsString()
  text: string;

  @Field(() => String)
  @IsString()
  chatId: string;
}
