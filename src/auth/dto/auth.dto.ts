import { IsBoolean, IsEmail, IsString, MinLength } from 'class-validator';
import { Optional } from '@nestjs/common';

export class AuthDto {
  @IsEmail()
  email: string;

  @MinLength(6, {
    message: 'Password must be at least 6 characters long',
  })

  @IsString()
  password: string;
}
