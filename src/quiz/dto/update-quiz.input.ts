import { Field, ID, InputType, PartialType } from "@nestjs/graphql";
import { IsOptional, IsUUID } from "class-validator";
import { QuizInput } from "./quiz.input";

@InputType()
export class UpdateQuizInput extends PartialType(QuizInput) {
  @Field(() => ID)
  @IsUUID()
  @IsOptional()
  id?: string;
}
