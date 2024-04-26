import { Field, InputType } from "@nestjs/graphql";
import { Type } from "class-transformer";
import { IsArray, IsNotEmpty, IsOptional, IsString, ValidateNested } from "class-validator";

@InputType()
class QuestionInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  question: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  answer: string;
}

@InputType()
export class QuizInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  title: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => [QuestionInput])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionInput)
  questions: QuestionInput[];
}
