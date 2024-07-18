import { Field, ID, InputType } from "@nestjs/graphql";
import { IsUUID } from "class-validator";

@InputType()
export class CourseAIHistoryInput {
  @Field(() => ID)
  @IsUUID()
  courseId: string;
}
