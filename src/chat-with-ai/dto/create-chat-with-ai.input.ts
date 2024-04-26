import { Field, ID, ObjectType } from "@nestjs/graphql";
import { IsString, IsUUID } from "class-validator";

@ObjectType()
export class ChatWithAI {
  @Field(() => ID)
  @IsString()
  @IsUUID()
  id: string;

  @Field(() => String)
  @IsString()
  title: string;

  @Field(() => String)
  @IsString()
  @IsUUID()
  userId: string;
}
