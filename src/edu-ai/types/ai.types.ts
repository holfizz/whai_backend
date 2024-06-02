import { MessageTypeWithAI, MessageWithAIRole } from "@prisma/client";
import { Type } from "class-transformer";
import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";

class Message {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  file: string;

  @IsEnum(MessageTypeWithAI)
  type: MessageTypeWithAI;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsEnum(MessageWithAIRole)
  role: MessageWithAIRole;

  @IsString()
  @IsNotEmpty()
  chatWithAIId: string;
}

export class AIDTO {
  @Type(() => Message)
  @IsOptional()
  messagesHistory?: Message[];

  @IsString()
  @IsNotEmpty()
  content: string;
}
