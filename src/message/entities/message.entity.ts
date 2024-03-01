import { Field, ID, ObjectType, registerEnumType } from "@nestjs/graphql";
import { MessageType } from "@prisma/client";
import { IsDate, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
registerEnumType(MessageType, {
  name: "MessageType",
});
@ObjectType()
export class Message {
  @Field(() => ID)
  @IsNumber()
  id: number;

  @Field(() => ID)
  @IsNumber()
  userId: number;

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

  @Field()
  @IsNotEmpty()
  @IsDate()
  createdAt: Date;

  @Field(() => String)
  @IsNotEmpty()
  @IsDate()
  updatedAt: Date;

  @Field(() => ID)
  @IsOptional()
  @IsInt()
  @IsNumber()
  chatId: number;

  // @Field(() => [ChatMembers])
  // @IsNotEmpty()
  // chatMembers: ChatMembers[];
}
