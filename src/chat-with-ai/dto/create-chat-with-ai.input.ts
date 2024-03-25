import { Field, Int, ObjectType } from "@nestjs/graphql";
import { IsNumber, IsString } from "class-validator";

@ObjectType()
export class ChatWithAI {
  @Field(() => Int)
  @IsNumber()
  id: number;

  @Field(() => String)
  @IsString()
  title: string;

  @Field(() => String)
  @IsString()
  userId: number;
}
