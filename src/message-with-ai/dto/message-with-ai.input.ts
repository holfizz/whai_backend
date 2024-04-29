import { Field, ID, InputType } from "@nestjs/graphql";
import { IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";

@InputType()
export class MessageWithAIInput {
  @IsString()
  @Field(() => ID)
  @IsUUID()
  chatWithAIId: string;

  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  content: string;
}

@InputType()
export class GetAllMessagesInput {
  @IsString()
  @Field(() => ID)
  @IsUUID()
  chatId: string;

  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  perPage?: string;

  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  page?: string;
}
