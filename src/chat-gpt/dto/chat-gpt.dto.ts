import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ChatGptRequestDto {
  @ApiProperty({
    example: 'what is 1 + 1',
    description: 'Your request ChatGpt',
  })
  @IsString()
  @IsNotEmpty()
  message: string;
}

export class ChatGptAnswerDto {
  @ApiProperty({
    example: '2',
    description: 'ChatGpt answer',
  })
  @IsString()
  @IsNotEmpty()
  aiMessage: string;
  static getInstance(aiMessage: string) {
    const result = new ChatGptAnswerDto();
    result.aiMessage = aiMessage;
    return result;
  }
}
