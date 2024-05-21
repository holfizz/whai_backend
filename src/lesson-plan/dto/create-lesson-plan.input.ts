import { Field, InputType, registerEnumType } from "@nestjs/graphql";
import { IconType } from "@prisma/client";
import { IsOptional, IsString, IsUUID } from "class-validator";

registerEnumType(IconType, {
  name: "IconType",
});
@InputType()
export class CreateLessonPlanInput {
  @Field(() => String)
  @IsUUID()
  subtopicPlanId: string;

  @Field(() => String)
  @IsString()
  title: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field(() => [IconType])
  @IsString({ each: true })
  icons: IconType[];
}
