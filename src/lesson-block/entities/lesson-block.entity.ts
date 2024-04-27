import { BaseEntity } from "@/helpers/base.entity";
import { Field, ID, Int, ObjectType, registerEnumType } from "@nestjs/graphql";
import { LessonBlockEnum } from "@prisma/client";
import { IsEnum, IsInt, IsOptional, IsString, IsUUID } from "class-validator";
registerEnumType(LessonBlockEnum, {
  name: "LessonBlockEnum",
});
@ObjectType()
export class LessonBlock extends BaseEntity {
  @Field(() => LessonBlockEnum)
  @IsEnum(LessonBlockEnum)
  type: LessonBlockEnum;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  code?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  text?: string;

  @Field({ nullable: true })
  @IsOptional()
  videoUrl?: string;

  @Field({ nullable: true })
  @IsOptional()
  imageUrl?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  document?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  duration?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  caption?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  language?: string;

  @Field(() => ID)
  @IsUUID()
  lessonId: string;
}
