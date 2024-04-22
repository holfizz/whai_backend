import { Field, ID, ObjectType } from "@nestjs/graphql";
import { IsString } from "class-validator";

@ObjectType()
export class ChatMember {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  @IsString()
  userId: string;

  @Field(() => ID)
  @IsString()
  chatId: string;

  @Field(() => Date)
  createdAt: Date;
}
