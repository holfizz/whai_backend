import { BaseEntity } from "@/helpers/base.entity";
import { Field, ObjectType } from "@nestjs/graphql";
import { IsOptional, IsString } from "class-validator";

@ObjectType()
export class CoursePlan extends BaseEntity {
  @Field(() => String)
  @IsString()
  title: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  description?: string;
}
