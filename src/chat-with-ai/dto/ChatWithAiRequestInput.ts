import { Field, ID, InputType } from "@nestjs/graphql";
import { IsNotEmpty, IsString } from "class-validator";


@InputType()
export class ChatWithAiRequestInput {
  @IsString()
  @Field(() => ID)
  IsUUID();
  chatWithAIId: string;

  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  content: string;
}
