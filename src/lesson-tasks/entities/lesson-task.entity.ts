import { BaseEntity } from "@/helpers/base.entity";
import { Field, ID, ObjectType } from "@nestjs/graphql";
import { IsBoolean, IsOptional, IsString, IsUUID } from "class-validator";

@ObjectType()
export class LessonTasks extends BaseEntity {
  @Field(() => String)
  @IsString()
  name: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field(() => Boolean)
  @IsBoolean()
  isChecked: boolean;

  @Field(() => ID)
  @IsUUID()
  lessonId: string;
}

@ObjectType()
export class LessonHomeworkResponse extends BaseEntity {
  @Field(() => String)
  @IsString()
  status: string;

  @Field(() => String)
  @IsString()
  reason?: string;
}
