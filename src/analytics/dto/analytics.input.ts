import { Field, Float, GraphQLISODateTime, ID, InputType } from "@nestjs/graphql";
import { IsDate, IsNumber, IsOptional, IsString, IsUUID } from "class-validator";

@InputType()
export class SessionDetailsInput {
  @Field(() => ID)
  @IsUUID()
  courseId: string;

  @Field(() => GraphQLISODateTime)
  @IsDate()
  date: Date;

  @Field(() => Float)
  @IsNumber()
  hoursSpent: number;

  @Field(() => Float, { nullable: true })
  @IsNumber()
  @IsOptional()
  progress: number;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  topic: string;
}

@InputType()
export class LearningSessionInput {
  @Field(() => [SessionDetailsInput])
  sessionDetails: SessionDetailsInput[];
}
