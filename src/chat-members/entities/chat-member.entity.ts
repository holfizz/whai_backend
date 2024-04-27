import { BaseEntity } from "@/helpers/base.entity";
import { Field, ID, ObjectType } from "@nestjs/graphql";
import { IsString, IsUUID } from "class-validator";

@ObjectType()
export class ChatMember extends BaseEntity {
  @IsUUID()
  @Field(() => ID)
  @IsString()
  userId: string;
  @IsUUID()
  @Field(() => ID)
  @IsString()
  chatId: string;
}
