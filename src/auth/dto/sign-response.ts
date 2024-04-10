import { User } from "@/user/entities/user.entity";
import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class SignResponse {
  @Field(type => String)
  accessToken: string;

  @Field(() => User)
  user: User;
}
