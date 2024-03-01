import { Field, ID, InputType } from "@nestjs/graphql";
import { PartialType } from "@nestjs/swagger";
import { IsNumber } from "class-validator";
import { CreateMessageDto } from "./create-message.dto";

@InputType()
export class UpdateMessageDto extends PartialType(CreateMessageDto) {
  @Field(() => ID)
  @IsNumber()
  id: number;
}
