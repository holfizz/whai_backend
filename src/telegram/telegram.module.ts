import { Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { TelegrafModule } from 'nestjs-telegraf';
import { options } from './telegram-config.factory';
import { ChatModule } from '@/chat/chat.module';
import { OggConverterModule } from '@/ogg-converter/ogg-converter.module';
import { OggConverterService } from '@/ogg-converter/ogg-converter.service';
import { FluentFfmpegModule } from '@mrkwskiti/fluent-ffmpeg-nestjs';

@Module({
  imports: [
    TelegrafModule.forRootAsync(options()),
    ChatModule,
    OggConverterModule,
    FluentFfmpegModule.forRoot(),
  ],
  providers: [TelegramService, OggConverterService],
})
export class TelegramModule {}
