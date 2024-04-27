import { BaseEntity } from "@/helpers/base.entity";
import { Field, ID, Int, ObjectType, registerEnumType } from "@nestjs/graphql";
import { QuizQuestionType } from "@prisma/client";
import { IsEnum, IsInt, IsJSON, IsOptional, IsString, IsUUID, Min } from "class-validator";
import GraphQLJSON from "graphql-type-json";
registerEnumType(QuizQuestionType, {
  name: "QuizQuestionType",
});

@ObjectType()
export class Quiz extends BaseEntity {
  @Field(() => String)
  @IsString()
  name: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => [QuizQuestionType])
  @IsEnum(QuizQuestionType)
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

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  instructions?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  @IsJSON()
  pairs?: object;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  correctIndex?: number;
}
