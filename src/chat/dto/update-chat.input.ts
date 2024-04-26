import { Field, ID, InputType, PartialType } from "@nestjs/graphql";
import { IsOptional, IsString, IsUUID } from "class-validator";
import { CreateChatInput } from "./create-chat.input";

@InputType()
export class UpdateChatInput extends PartialType(CreateChatInput) {
  @IsString()
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  ownerId?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  inviteLink?: string;
}
