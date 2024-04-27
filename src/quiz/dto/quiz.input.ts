import { Field, InputType } from "@nestjs/graphql";
import { IsArray, IsNotEmpty, IsOptional, IsString, ValidateNested } from "class-validator";

@InputType()
class QuestionType {
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

  @Field(() => String)
  @IsArray()
  @ValidateNested({ each: true })
  question: string;
}
