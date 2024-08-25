import { Field, ID, InputType, PartialType } from "@nestjs/graphql";
import { IsBoolean, IsEmail, IsEnum, IsOptional, IsString, IsUUID, MinLength } from "class-validator";
import { UserInput, UserMode } from "./user.input";

@InputType()
export class UpdateUserInput extends PartialType(UserInput) {
  @Field(() => ID, { nullable: true })
  @IsUUID()
  @IsOptional()
  id?: string;
  @IsEmail(
    {},
    {
      message: "email must be an email",
    },
  )
  @Field(type => String, { nullable: true })
  @IsOptional()
  email?: string;

  @MinLength(6, {
    message: "Password must be at least 6 characters long",
  })
  @IsString()
  @Field(type => String, { nullable: true })
  @IsOptional()
  password?: string;

  @IsString()
  @Field(type => String, { nullable: true })
  @IsOptional()
  firstName?: string;

  @IsString()
  @Field(type => String, { nullable: true })
  @IsOptional()
  lastName?: string;

  // @MinLength(9)
  // @MaxLength(12)
  @IsString()
  @Field(type => String, { nullable: true })
  @IsOptional()
  phoneNumber?: string;

  @IsEnum(UserMode)
  @Field(type => UserMode, { nullable: true })
  @IsOptional()
  userMode?: UserMode;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  isAutoRenewal?: boolean;
}
