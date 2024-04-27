import { Field, InputType } from "@nestjs/graphql";
import { IsNotEmpty, IsOptional, IsString, ValidateNested } from "class-validator";

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
  @ValidateNested({ each: true })
  question: string;
}
