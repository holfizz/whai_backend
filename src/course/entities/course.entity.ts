import { BaseEntity } from "@/helpers/base.entity";
import { Field, ObjectType, registerEnumType } from "@nestjs/graphql";
import { CourseLevelEnum } from "@prisma/client";
import { IsEnum, IsOptional, IsString, IsUrl } from "class-validator";

registerEnumType(CourseLevelEnum, {
  name: "CourseLevelEnum",
});
@ObjectType()
export class Course extends BaseEntity {
  @Field()
  @IsString()
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @Field({ nullable: true })
  @IsOptional()
  publicUrl?: string;

  @Field(() => [String], { nullable: "itemsAndList" })
  @IsString({ each: true })
  tags: string[];

  @Field(() => CourseLevelEnum, { nullable: true })
  @IsEnum(CourseLevelEnum)
  @IsOptional()
  level?: CourseLevelEnum;

  @Field(() => [String], { nullable: true })
  @IsString({ each: true })
  @IsOptional()
  teacherIds?: string[];

  @Field(() => [String], { nullable: true })
  @IsString({ each: true })
  @IsOptional()
  studentIds?: string[];
}
