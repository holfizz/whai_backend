import { Field, ID, InputType, PartialType } from "@nestjs/graphql";
import { IsOptional, IsUUID } from "class-validator";
import { Topic } from "../entities/topic.entity";
import { TopicInput } from "./create-topic.input";

@InputType()
export class UpdateTopicInput extends PartialType(TopicInput) {
  @Field(() => ID, { nullable: true })
  @IsUUID()
  @IsOptional()
  id?: string;
}
