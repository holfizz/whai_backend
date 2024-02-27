import { Field } from "@nestjs/graphql";
import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, MinLength } from "class-validator";

export class AuthLoginDto {
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
}
export class AuthSignUpDto {
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
}
