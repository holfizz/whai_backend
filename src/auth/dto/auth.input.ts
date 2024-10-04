import { Field, InputType } from "@nestjs/graphql";
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";

@InputType()
export class SignUpInput {
  @IsEmail(
    {},
    {
      message: "email must be an email",
    },
  )
  @IsNotEmpty()
  @Field(() => String)
  email: string;
  @MinLength(6, {
    message: "Password must be at least 6 characters long",
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  password: string;

  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  lastName: string;

  // @MinLength(9)
  // @MaxLength(12)
  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  phoneNumber: string;

  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  referralCode?: string;
}

@InputType()
export class loginInput {
  @IsEmail({}, { message: "email must be an email" })
  @IsNotEmpty()
  @Field(() => String)
  email: string;

  @MinLength(6, { message: "Password must be at least 6 characters long" })
  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  password: string;
}

@InputType()
export class ResetPasswordInput {
  @MinLength(6, { message: "Password must be at least 6 characters long" })
  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  password: string;

  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  token: string;
}

@InputType()
export class ActivationLinkInput {
  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  activationLink: string;
}
