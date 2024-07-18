import { BaseEntity } from "@/helpers/base.entity";
import { Field, ID, ObjectType } from "@nestjs/graphql";
import { IsOptional, IsString, IsUUID } from "class-validator";

@ObjectType()
export class ChatWithAI extends BaseEntity {
  @Field(() => String)
  @IsString()
  title: string;

  @Field(() => String)
  @IsString()
  @IsUUID()
  userId: string;

  @Field(() => ID, { nullable: true })
  @IsUUID()
  @IsOptional()
  lessonId: string;
}
