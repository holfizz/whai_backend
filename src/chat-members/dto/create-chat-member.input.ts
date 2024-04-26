import { Field, ID, InputType } from "@nestjs/graphql";
import { IsString, IsUUID } from "class-validator";

@InputType()
export class CreateChatMemberInput {
  @Field(() => ID)
  @IsUUID()
  @IsString()
  userId: string;

  @Field(() => ID)
  @IsUUID()
  @IsString()
  chatId: string;
}
