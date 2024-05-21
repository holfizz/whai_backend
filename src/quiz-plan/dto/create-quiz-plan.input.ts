import { Field, InputType, registerEnumType } from "@nestjs/graphql";
import { IconType } from "@prisma/client";
import { IsOptional, IsString, IsUUID } from "class-validator";

registerEnumType(IconType, {
  name: "IconType",
});
@InputType()
export class CreateQuizPlanInput {
  @Field(() => String, { nullable: true })
  @IsUUID()
  @IsOptional()
  subtopicPlanId?: string;

  @Field(() => String, { nullable: true })
  @IsUUID()
  @IsOptional()
  modulePlanId?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field(() => IconType)
  @IsString()
  icon: IconType;
}
