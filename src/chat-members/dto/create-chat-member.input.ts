import { Field, ID, InputType } from "@nestjs/graphql";
import { IsString } from "class-validator";

@InputType()
export class CreateChatMemberInput {
  @Field(() => ID)
  @IsString()
  userId: string;

  @Field(() => ID)
  @IsString()
  chatId: string;
}
