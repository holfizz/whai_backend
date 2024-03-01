import { Field, InputType, Int } from "@nestjs/graphql";
import { IsNumber, IsString } from "class-validator";

@InputType()
export class CreateMessageInput {
  @Field(() => String)
  @IsString()
  text: string;

  @Field(() => Int)
  @IsNumber()
  chatId: number;
}
