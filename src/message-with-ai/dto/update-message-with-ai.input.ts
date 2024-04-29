import { Field, InputType, Int, PartialType } from "@nestjs/graphql";
import { MessageWithAIInput } from "./message-with-ai.input";

@InputType()
export class UpdateMessageWithAiInput extends PartialType(MessageWithAIInput) {
  @Field(() => Int)
  id: number;
}
