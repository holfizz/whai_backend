import { Field, ID, InputType } from "@nestjs/graphql";
import { IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";

@InputType()
export class CourseInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  title: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => ID)
  @IsString()
  ownerId: string;
}

@InputType()
export class AddVideoToCourseInput {
  @Field(() => ID)
  @IsUUID()
  courseId: string;

  @Field(() => String)
  videoUrl: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  title: string;
}
