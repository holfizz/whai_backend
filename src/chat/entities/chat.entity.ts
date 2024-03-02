import { Field, ID, ObjectType } from "@nestjs/graphql";
import { IsOptional, IsString } from "class-validator";
@ObjectType()
export class Chat {
  @Field(() => ID)
  @IsString()
  id: number;

  @Field(() => String)
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  @Field(() => ID)
  ownerId: number;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  inviteLink?: string;

  // @Field(()=>SVGAElement)
  // messages:
}
