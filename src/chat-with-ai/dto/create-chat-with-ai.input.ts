import { Field, ID, ObjectType } from "@nestjs/graphql";
import { IsString } from "class-validator";

@ObjectType()
export class ChatWithAI {
  @Field(() => ID)
  @IsString()
  id: string;

  @Field(() => String)
  @IsString()
  title: string;

  @Field(() => String)
  @IsString()
  userId: string;
}
