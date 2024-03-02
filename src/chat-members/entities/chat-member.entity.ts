import { Field, Int, ObjectType } from "@nestjs/graphql";
import { IsNumber } from "class-validator";

@ObjectType()
export class ChatMember {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  @IsNumber()
  userId: number;

  @Field(() => Int)
  @IsNumber()
  chatId: number;

  @Field(() => Date)
  createdAt: Date;
}
