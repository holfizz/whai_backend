import { Field, ID, ObjectType } from "@nestjs/graphql";
import { IsString, IsUUID } from "class-validator";

@ObjectType()
export class ChatMember {
  @Field(() => ID)
  id: string;
  @IsUUID()
  @Field(() => ID)
  @IsString()
  userId: string;
  @IsUUID()
  @Field(() => ID)
  @IsString()
  chatId: string;
  @IsUUID()
  @Field(() => Date)
  createdAt: Date;
}
