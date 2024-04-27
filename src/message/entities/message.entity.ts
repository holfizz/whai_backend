import { BaseEntity } from "@/helpers/base.entity";
import { Field, ID, ObjectType, registerEnumType } from "@nestjs/graphql";
import { MessageType } from "@prisma/client";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";
registerEnumType(MessageType, {
  name: "MessageType",
});
@ObjectType()
export class Message extends BaseEntity {
  @Field(() => ID)
  @IsString()
  userId: string;

  @Field(() => MessageType)
  type: MessageType;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  text: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  file?: string;

  @Field(() => ID)
  @IsOptional()
  @IsString()
  chatId: string;

  // @Field(() => [ChatMembers])
  // @IsNotEmpty()
  // chatMembers: ChatMembers[];
}
