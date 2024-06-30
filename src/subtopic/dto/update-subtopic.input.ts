import { Field, ID, InputType, PartialType } from "@nestjs/graphql";
import { IsOptional, IsUUID } from "class-validator";
import { Subtopic } from "../entities/subtopic.entity";

@InputType()
export class UpdateSubtopicInput extends PartialType(Subtopic) {
  @Field(() => ID, { nullable: true })
  @IsUUID()
  @IsOptional()
  id?: string;
}
