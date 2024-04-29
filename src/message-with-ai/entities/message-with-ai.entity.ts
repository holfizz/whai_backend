import { Field, ID, ObjectType, registerEnumType } from "@nestjs/graphql";
import { MessageWithAIRole } from "@prisma/client";
import { IsUUID } from "class-validator";
registerEnumType(MessageWithAIRole, {
  name: "MessageWithAIRole",
});

@ObjectType()
export class MessageWithAIData {
  @Field(() => MessageWithAIRole)
  role: MessageWithAIRole;

  @Field(() => String)
  type: string;

  @Field(() => String)
  content: string;

  @Field(() => String, { nullable: true })
  content_type?: string;

  @Field(() => String, { nullable: true })
  extra_info?: string;
}

@ObjectType()
export class MessageWithAI {
  @Field(() => ID)
  @IsUUID()
  id: string;

  @Field(() => MessageWithAIData)
  message: MessageWithAIData;

  @Field(() => String)
  conversation_id: string;

  @Field(() => Boolean)
  is_finish: boolean;
}
