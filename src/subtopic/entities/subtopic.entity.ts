import { BaseEntity } from "@/helpers/base.entity";
import { Field, Float, ID, ObjectType } from "@nestjs/graphql";
import { IsNumber, IsOptional, IsString, IsUUID } from "class-validator";

@ObjectType()
export class Subtopic extends BaseEntity {
  @Field(() => String)
  @IsString()
  name: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field(() => ID)
  @IsUUID()
  topicId: string;

  @Field(() => Float)
  @IsNumber()
  progressPercents: number;
}
