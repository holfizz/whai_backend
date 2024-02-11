import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { TelegramModule } from './telegram/telegram.module';
import { ChatModule } from './chat/chat.module';
import { OggConverterModule } from './ogg-converter/ogg-converter.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    ConfigModule.forRoot(),
    AuthModule,
    TelegramModule,
    ChatModule,
    OggConverterModule,
  ],
})
export class AppModule {}
