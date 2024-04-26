import { Field, ID, Int, ObjectType, registerEnumType } from "@nestjs/graphql";
import { QuizQuestionType } from "@prisma/client";
import { IsEnum, IsInt, IsJSON, IsOptional, IsString, IsUUID, Min } from "class-validator";

registerEnumType(QuizQuestionType, {
  name: "QuizQuestionType",
});
@ObjectType()
export class Quiz {
  @Field(() => ID)
  @IsUUID()
  id: string;

  @Field(() => String)
  @IsString()
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsJSON()
  questions: object;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  lessonBlockId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  folderId?: string;

  @Field(() => QuizQuestionType)
  @IsEnum(QuizQuestionType)
  questionType: QuizQuestionType;

  @Field()
  @IsString()
  answer: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsJSON()
  options?: object;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  template?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  instructions?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsJSON()
  pairs?: object;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  correctIndex?: number;
}
