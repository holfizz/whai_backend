import { Field, ID, InputType } from "@nestjs/graphql";
import { IsNumber, IsString } from "class-validator";
@InputType()
export class CreateMessageDto {
  @Field(() => String)
  @IsString()
  text: string;

  @Field(() => ID)
  @IsNumber()
  chatId: number;
}
