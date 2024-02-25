import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class createChatWithAI {
  @IsString()
  title: string;
}

export class chatWithAiRequestDto {
  @IsNumber()
  chatWithAIId: number;

  @ApiProperty({
    example: "what is 1 + 1",
    description: "Your request ChatGpt",
  })
  @IsOptional()
  @IsString()
  file?: string;

  @IsString()
  @IsNotEmpty()
  text: string;
}

export class chatWithAiAnswerDto {
  @ApiProperty({
    example: "2",
    description: "ChatGpt answer",
  })
  @IsString()
  @IsNotEmpty()
  aiMessage: string;
  static getInstance(aiMessage: string) {
    const result = new chatWithAiAnswerDto();
    result.aiMessage = aiMessage;
    return result;
  }
}
