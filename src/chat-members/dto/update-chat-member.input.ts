import { InputType, PartialType } from "@nestjs/graphql";
import { CreateChatMemberInput } from "./create-chat-member.input";

@InputType()
export class UpdateChatMemberInput extends PartialType(CreateChatMemberInput) {}
