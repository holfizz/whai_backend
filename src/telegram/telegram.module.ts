import { Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { TelegrafModule } from 'nestjs-telegraf';
import { options } from './telegram-config.factory';
import { OggConverterModule } from '@/ogg-converter/ogg-converter.module';
import { OggConverterService } from '@/ogg-converter/ogg-converter.service';
import { OpenaiModule } from '@/openai/openai.module';
import { OpenaiService } from '@/openai/openai.service';

@Module({
  imports: [
    TelegrafModule.forRootAsync(options()),
    OggConverterModule,
    OpenaiModule,
  ],
  providers: [TelegramService, OggConverterService, OpenaiService],
})
export class TelegramModule {}
