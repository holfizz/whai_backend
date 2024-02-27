import { User } from "@/user/dto/user.module";
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
