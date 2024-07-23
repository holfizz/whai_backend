import { Field, ID, InputType } from "@nestjs/graphql";
import { IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";

@InputType()
export class CourseInput {
  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  name?: string;
  w;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  description?: string;
}

@InputType()
export class AddVideoToCourseInput {
  @Field(() => ID)
  @IsUUID()
  courseId: string;

  @Field(() => String)
  videoUrl: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  name: string;
}
