import { BaseEntity } from "@/helpers/base.entity";
import { Field, ID, ObjectType } from "@nestjs/graphql";
import { IsOptional, IsString, IsUUID } from "class-validator";

@ObjectType()
export class Folder extends BaseEntity {
  @Field(() => String)
  @IsString()
  name: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field(() => ID)
  @IsUUID()
  courseId: string;
}
