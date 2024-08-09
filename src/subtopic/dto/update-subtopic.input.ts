import { Field, ID, InputType, PartialType } from "@nestjs/graphql";
import { IsOptional, IsUUID } from "class-validator";
import { Subtopic } from "../entities/subtopic.entity";
import { SubtopicInput } from "./create-subtopic.input";

@InputType()
export class UpdateSubtopicInput extends PartialType(SubtopicInput) {
  @Field(() => ID, { nullable: true })
  @IsUUID()
  @IsOptional()
  id?: string;
}
