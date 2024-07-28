import { Field, ID, ObjectType, registerEnumType } from "@nestjs/graphql";
import { MessageWithAIRole } from "@prisma/client";
import { IsArray, IsString, IsUUID } from "class-validator";

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

@ObjectType()
export class GenerateTD {
  @Field(() => String)
  @IsString()
  title: string;

  @Field(() => String)
  @IsString()
  description: string;
}

@ObjectType()
export class KnowledgeSum {
  @Field(() => String)
  @IsString()
  summary: string;

  @Field(() => [String])
  @IsArray()
  @IsString({ each: true })
  strongPoints: string[];

  @Field(() => [String])
  @IsArray()
  @IsString({ each: true })
  weakPoints: string[];

  @Field(() => [String])
  @IsArray()
  @IsString({ each: true })
  recommendations: string[];
}
