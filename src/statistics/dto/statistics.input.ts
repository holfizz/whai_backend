import { Field, InputType, Int } from "@nestjs/graphql";

@InputType()
export class RegistrationFilterInput {
  @Field(() => Int, { nullable: true })
  startYear?: number;

  @Field(() => Int, { nullable: true })
  endYear?: number;
}
