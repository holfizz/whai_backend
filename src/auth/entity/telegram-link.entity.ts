import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class TelegramLink {
  @Field()
  link: string;

  @Field()
  message: string;
}
