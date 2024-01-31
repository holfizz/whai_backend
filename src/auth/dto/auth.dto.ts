import { IsEmail, IsString, MinLength } from 'class-validator';

export class AuthDto {
  @IsEmail(
    {},
    {
      message: 'email must be an email',
    },
  )
  email: string;

  @MinLength(6, {
    message: 'Password must be at least 6 characters long',
  })
  @IsString()
  password: string;
}
