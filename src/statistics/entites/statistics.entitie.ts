import { Field, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class UserRegistrationStats {
  @Field(() => String)
  month: string;

  @Field(() => Int)
  year: number;

  @Field(() => Int)
  count: number;
}
@ObjectType()
export class UserCountStat {
  @Field(() => String)
  name: string;

  @Field(() => String)
  value: number;
}
