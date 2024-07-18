import { BaseEntity } from "@/helpers/base.entity";
import { Field, ID, ObjectType } from "@nestjs/graphql";
import { IsString, IsUUID } from "class-validator";
import { MessageWithAI } from "@/message-with-ai/entities/message-with-ai.entity";

@ObjectType()
export class CourseAIHistory extends BaseEntity {
  @Field(() => String)
  @IsString()
  @IsUUID()
  userId: string;

  @Field(() => ID)
  @IsUUID()
  courseId: string;

  @Field(() => [MessageWithAI], { nullable: true })
  messages?: MessageWithAI[];
}
