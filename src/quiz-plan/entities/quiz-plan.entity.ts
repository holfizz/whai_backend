import { BaseEntity } from "@/helpers/base.entity";
import { Field, ObjectType, registerEnumType } from "@nestjs/graphql";
import { IconType } from "@prisma/client";
import { IsOptional, IsString } from "class-validator";

registerEnumType(IconType, {
  name: "IconType",
});

@ObjectType()
export class QuizPlan extends BaseEntity {
  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field(() => IconType)
  icon: IconType;
}
