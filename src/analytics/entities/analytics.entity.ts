import { BaseEntity } from "@/helpers/base.entity";
import { Field, Float, GraphQLISODateTime, ID, ObjectType } from "@nestjs/graphql";
import { IsDate, IsNumber, IsOptional, IsString, IsUUID } from "class-validator";

@ObjectType()
export class SessionDetails {
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
@ObjectType()
export class LearningSession extends BaseEntity {
  @Field(() => ID)
  @IsUUID()
  userId: string;

  @Field(() => [SessionDetails])
  sessionDetails: SessionDetails[];
}
