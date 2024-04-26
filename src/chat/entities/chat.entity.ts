import { Field, ID, ObjectType } from "@nestjs/graphql";
import { IsOptional, IsString, IsUUID } from "class-validator";
@ObjectType()
export class Chat {
  @Field(() => ID)
  @IsString()
  id: string;
  @IsUUID()
  @Field(() => String)
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  @Field(() => ID)
  @IsUUID()
  ownerId: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  inviteLink?: string;

  // @Field(()=>SVGAElement)
  // messages:
}
