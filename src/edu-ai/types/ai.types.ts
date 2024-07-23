import { MessageTypeWithAI, MessageWithAIRole } from "@prisma/client";
import { IsEnum, IsNotEmpty, IsString } from "class-validator";

export class Message {
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
  courseAIHistoryId: string;
}

export class AIDTO {
  @IsString()
  @IsNotEmpty()
  content: any;
}
