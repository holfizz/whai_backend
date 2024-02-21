import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export enum UserMode {
  'STUDENT' = 'STUDENT',
  'CREATOR' = 'CREATOR',
}

export class UserDto {
  @ApiProperty({ example: 'exaple@mail.com', description: 'user email' })
  @IsEmail(
    {},
    {
      message: 'email must be an email',
    },
  )
  email: string;
  @ApiProperty({ example: 'password123', description: 'user password' })
  @MinLength(6, {
    message: 'Password must be at least 6 characters long',
  })
  @IsString()
  password: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  // @MinLength(9)
  // @MaxLength(12)
  @IsString()
  phoneNumber: string;

  @IsOptional()
  avatarPath: string;

  @IsEnum(UserMode)
  userMode: UserMode;
}
export class UpdateUserDto extends PartialType(UserDto) {}
