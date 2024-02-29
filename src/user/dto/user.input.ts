import { Field, InputType, registerEnumType } from "@nestjs/graphql";
import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsEnum, IsString, MinLength } from "class-validator";
export enum UserMode {
  "STUDENT" = "STUDENT",
  "CREATOR" = "CREATOR",
}
registerEnumType(UserMode, {
  name: "UserMode",
});
@InputType()
export class UserInput {
  @ApiProperty({ example: "exaple@mail.com", description: "user email" })
  @IsEmail(
    {},
    {
      message: "email must be an email",
    },
  )
  @Field(type => String)
  email: string;

  @ApiProperty({ example: "password123", description: "user password" })
  @MinLength(6, {
    message: "Password must be at least 6 characters long",
  })
  @IsString()
  @Field(type => String)
  password: string;

  @IsString()
  @Field(type => String)
  firstName: string;

  @IsString()
  @Field(type => String)
  lastName: string;

  // @MinLength(9)
  // @MaxLength(12)
  @IsString()
  @Field(type => String)
  phoneNumber: string;

  @IsEnum(UserMode)
  @Field(type => UserMode)
  userMode: UserMode;
}
