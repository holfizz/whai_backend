import { Field, ID, InputType } from "@nestjs/graphql";
import { IsOptional, IsString, IsUUID } from "class-validator";

@InputType()
export class LessonTasksInput {
  @Field()
  @IsString()
  name: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field(() => ID)
  @IsString()
  @IsUUID()
  lessonId: string;
}
@InputType()
export class CheckHomeworkDto {
  @Field(() => String)
  @IsString()
  lessonTaskId: string;
}
