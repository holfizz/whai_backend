import { FileService } from '@/file/file.service';
import { PrismaService } from '@/prisma.service';
import { Module } from '@nestjs/common';
import { ChatWithAIController } from './chat-with-ai.controller';
import ChatWithAIService from './chat-with-ai.service';

@Module({
  controllers: [ChatWithAIController],
  providers: [ChatWithAIService, PrismaService, FileService],
  imports: [],
})
export class ChatWIthAIModule {}
