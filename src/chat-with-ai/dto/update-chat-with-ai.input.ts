import { Field, ID, InputType, PartialType } from "@nestjs/graphql";
import { IsOptional, IsUUID } from "class-validator";
import { ChatWithAI } from "../entities/chat-with-ai.entity";

@InputType()
export class UpdateChatWithAIInput extends PartialType(ChatWithAI) {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  id?: string;
}
