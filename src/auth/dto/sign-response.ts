import { User } from "@/user/entities/user.entity";
import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class SignResponse {
  @Field()
  accessToken: string;

  @Field()
  refreshToken: string;

  @Field()
  user: User;
}
