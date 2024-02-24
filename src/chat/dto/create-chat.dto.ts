import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateChatDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsNumber()
  ownerId: number;
}
