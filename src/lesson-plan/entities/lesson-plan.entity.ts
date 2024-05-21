import { BaseEntity } from "@/helpers/base.entity";
import { Field, ObjectType, registerEnumType } from "@nestjs/graphql";
import { IconType } from "@prisma/client";
import { IsOptional, IsString } from "class-validator";

registerEnumType(IconType, {
  name: "IconType",
});
@ObjectType()
export class LessonPlan extends BaseEntity {
  @Field(() => String)
  @IsString()
  title: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field(() => [IconType])
  icons: IconType[];
}
