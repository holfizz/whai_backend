import { Field, ID, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class User {
  @Field(type => ID)
  id: number;

  @Field(type => String)
  createdAt: Date;

  @Field(type => String)
  updatedAt: Date;

  @Field(type => String)
  firstName: string;

  @Field(type => String)
  lastName: string;

  @Field(type => String)
  phoneNumber: string;

  @Field({ nullable: true })
  avatarPath?: string;

  @Field(type => String)
  email: string;

  @Field(type => String)
  password: string;

  @Field(type => Boolean)
  isAdmin: boolean;

  @Field(type => Boolean)
  isActivated: boolean;

  @Field({ nullable: true })
  resetPasswordToken?: string;

  @Field({ nullable: true })
  resetPasswordExpiration?: Date;
}
