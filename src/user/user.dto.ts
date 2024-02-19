import { IsEmail, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  @ApiProperty({ example: 'exaple@mail.com', description: 'user email' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', description: 'user password' })
  @IsOptional()
  @IsString()
  password?: string;
}
