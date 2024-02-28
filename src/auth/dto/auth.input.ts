import { Field, InputType } from "@nestjs/graphql";
import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

@InputType()
export class SignUpInput {
  @ApiProperty({ example: "exaple@mail.com", description: "user email" })
  @IsEmail(
    {},
    {
      message: "email must be an email",
    },
  )
  @IsNotEmpty()
  @Field(type => String)
  email: string;
  @ApiProperty({ example: "password123", description: "user password" })
  @MinLength(6, {
    message: "Password must be at least 6 characters long",
  })
  @IsString()
  @IsNotEmpty()
  @Field(type => String)
  password: string;

  @IsString()
  @IsNotEmpty()
  @Field(type => String)
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @Field(type => String)
  lastName: string;

  // @MinLength(9)
  // @MaxLength(12)
  @IsString()
  @IsNotEmpty()
  @Field(type => String)
  phoneNumber: string;
}

@InputType()
export class SignInInput {
  @IsEmail({}, { message: "email must be an email" })
  @IsNotEmpty()
  @Field(type => String)
  email: string;

  @MinLength(6, { message: "Password must be at least 6 characters long" })
  @IsString()
  @IsNotEmpty()
  @Field(type => String)
  password: string;
}

@InputType()
export class ResetPasswordInput {
  @MinLength(6, { message: "Password must be at least 6 characters long" })
  @IsString()
  @IsNotEmpty()
  @Field(type => String)
  password: string;

  @IsString()
  @IsNotEmpty()
  @Field(type => String)
  token: string;
}

@InputType()
export class ActivationLinkInput {
  @IsString()
  @IsNotEmpty()
  @Field(type => String)
  activationLink: string;
}
