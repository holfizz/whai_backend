import { BaseEntity } from "@/helpers/base.entity";
import { Field, ObjectType } from "@nestjs/graphql";
import { IsString, IsUUID } from "class-validator";

@ObjectType()
export class ChatWithAI extends BaseEntity {
  @Field(() => String)
  @IsString()
  title: string;

  @Field(() => String)
  @IsString()
  @IsUUID()
  userId: string;
}
