import { Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { TelegrafModule } from 'nestjs-telegraf';
import { options } from './telegram-config.factory';
import { ChatModule } from '../chat/chat.module';

@Module({
  imports: [TelegrafModule.forRootAsync(options()), ChatModule],
  providers: [TelegramService],
})
export class TelegramModule {}
