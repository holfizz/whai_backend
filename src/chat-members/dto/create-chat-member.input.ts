import { Field, InputType, Int } from "@nestjs/graphql";
import { IsNumber } from "class-validator";

@InputType()
export class CreateChatMemberInput {
  // @Field(() => Int, { description: 'Example field (placeholder)' })
  // id:number
  @Field(() => Int)
  @IsNumber()
  userId: number;

  @Field(() => Int)
  @IsNumber()
  chatId: number;
}
