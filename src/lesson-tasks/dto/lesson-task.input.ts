import { Field, ID, InputType } from "@nestjs/graphql";
import { IsBoolean, IsString, IsUUID } from "class-validator";

@InputType()
export class LessonTasksInput {
  @Field()
  @IsString()
  name: string;

  @Field(() => ID)
  @IsBoolean()
  @IsUUID()
  lessonId: string;
}
