import { Field, ID, InputType } from "@nestjs/graphql";
import { IsOptional, IsString, IsUUID } from "class-validator";

@InputType()
export class ChatWithAIInput {
  @IsString()
  @Field(() => String, { nullable: true })
  @IsOptional()
  title?: string;

  @Field(() => ID, { nullable: true })
  @IsUUID()
  @IsOptional()
  lessonId?: string;
}

@InputType()
export class GetChatWithAIInput {
  @Field(() => ID)
  @IsUUID()
  id: string;
}
