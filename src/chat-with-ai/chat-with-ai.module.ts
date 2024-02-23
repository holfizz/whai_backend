import { PrismaService } from '@/prisma.service';
import { Module } from '@nestjs/common';
import { ChatGptController } from './chat-with-ai.controller';
import ChatGptService from './chat-with-ai.service';

@Module({
  controllers: [ChatGptController],
  providers: [ChatGptService, PrismaService],
  imports: [],
})
export class ChatGptModule {}
