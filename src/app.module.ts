import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { TelegramModule } from './telegram/telegram.module';
import { OggConverterModule } from './ogg-converter/ogg-converter.module';
import { OpenaiModule } from '@/openai/openai.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    ConfigModule.forRoot(),
    AuthModule,
    TelegramModule,
    OggConverterModule,
    OpenaiModule,
  ],
})
export class AppModule {}
