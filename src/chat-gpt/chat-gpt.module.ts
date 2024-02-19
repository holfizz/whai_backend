import { Module } from '@nestjs/common';
import { ChatGptService } from './chat-gpt.service';
import { ChatGptController } from './chat-gpt.controller';
import { PrismaService } from '@/prisma.service';

@Module({
  controllers: [ChatGptController],
  providers: [ChatGptService, PrismaService],
  imports: [],
})
export class ChatGptModule {}
