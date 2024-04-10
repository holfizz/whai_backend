import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { IsString } from "class-validator";
@InputType()
export class RefreshTokenInput {
  @IsString()
  @Field(type => String)
  refreshToken: string;
}

@ObjectType()
export class RefreshTokenResponse {
  @Field(() => String)
  accessToken: string;
}
