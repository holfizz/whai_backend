import { BaseEntity } from "@/helpers/base.entity";
import { Field, ID, ObjectType } from "@nestjs/graphql";
import { IsBoolean, IsString, IsUUID } from "class-validator";

@ObjectType()
export class LessonTasks extends BaseEntity {
  @Field(() => String)
  @IsString()
  name: string;

  @Field(() => Boolean)
  @IsBoolean()
  isChecked: boolean;

  @Field(() => ID)
  @IsUUID()
  lessonId: string;
}
