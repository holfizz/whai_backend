import { Field, ID, InputType } from "@nestjs/graphql";
import { IsString, IsUUID } from "class-validator";

@InputType()
export class LessonTasksInput {
  @Field()
  @IsString()
  name: string;

  @Field(() => ID)
  @IsString()
  @IsUUID()
  lessonId: string;
}
