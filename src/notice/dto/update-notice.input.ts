import { Field, ID, InputType, PartialType } from "@nestjs/graphql";
import { IsBoolean, IsOptional, IsUUID } from "class-validator";
import { CreateNoticeInput } from "./create-notice.input";

@InputType()
export class UpdateNoticeInput extends PartialType(CreateNoticeInput) {
  @Field(() => ID, { nullable: true })
  @IsUUID()
  @IsOptional()
  id?: string;

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  readStatus?: boolean;
}
