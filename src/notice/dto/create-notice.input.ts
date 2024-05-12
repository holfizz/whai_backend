import { Field, InputType } from "@nestjs/graphql";
import { IsOptional, IsString, IsUUID } from "class-validator";

@InputType()
export class CreateNoticeInput {
  @Field(() => String)
  @IsString()
  title: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field(() => String, { nullable: true })
  @IsUUID()
  @IsOptional()
  senderId?: string;

  @Field(() => Boolean, { nullable: true })
  @IsUUID()
  @IsOptional()
  sendToTelegram?: boolean;
}
