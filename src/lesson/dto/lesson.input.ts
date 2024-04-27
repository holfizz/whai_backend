import { Field, InputType, registerEnumType } from "@nestjs/graphql";
import { LessonTypeEnum } from "@prisma/client";
import { IsOptional, IsString } from "class-validator";

registerEnumType(LessonTypeEnum, {
  name: "LessonTypeEnum",
});

@InputType()
export class LessonInput {
  @Field()
  @IsString()
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => [LessonTypeEnum])
  types: LessonTypeEnum[];
}
