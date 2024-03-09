import { Field, ID, ObjectType, registerEnumType } from "@nestjs/graphql";
import { UserRole } from "@prisma/client";
registerEnumType(UserRole, {
  name: "UserRole",
});
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

  @Field(type => [UserRole])
  roles: UserRole[];

  @Field(type => Boolean)
  isVerified: boolean;

  @Field({ nullable: true })
  resetPasswordToken?: string;

  @Field({ nullable: true })
  resetPasswordExpiration?: Date;
}
