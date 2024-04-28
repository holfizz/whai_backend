import { Field, ID, InputType, registerEnumType } from "@nestjs/graphql";
import { LessonTypeEnum } from "@prisma/client";
import { IsOptional, IsString, IsUUID } from "class-validator";

registerEnumType(LessonTypeEnum, {
  name: "LessonTypeEnum",
});

@InputType()
export class LessonInput {
  @Field(() => String)
  @IsString()
  name: string;

  @Field(() => ID)
  @IsString()
  @IsUUID()
  folderId: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => [LessonTypeEnum])
  types: LessonTypeEnum[];
}
