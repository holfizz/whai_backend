import { Field, ID, ObjectType } from "@nestjs/graphql";
import { IsArray, IsEnum, IsOptional, IsString, IsUUID, IsUrl } from "class-validator";

@ObjectType()
export class Course {
  @Field(() => ID)
  @IsUUID()
  id: string;

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
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  teacherIds?: string[];

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  studentIds?: string[];
}
