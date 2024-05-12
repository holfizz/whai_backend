import { BaseEntity } from "@/helpers/base.entity";
import { Field, ID, ObjectType } from "@nestjs/graphql";
import { IsBoolean, IsOptional, IsString, IsUUID } from "class-validator";

@ObjectType()
export class Notice extends BaseEntity {
  @Field(() => String)
  @IsString()
  title: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field(() => ID)
  @IsUUID()
  userId: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  telegramId?: string;

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  readStatus?: boolean;

  @Field(() => String, { nullable: true })
  @IsUUID()
  @IsOptional()
  senderId?: string;
}
