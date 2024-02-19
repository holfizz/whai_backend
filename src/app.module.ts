import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ChatGptModule } from './chat-gpt/chat-gpt.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    ConfigModule.forRoot(),
    AuthModule,
    ChatGptModule,
  ],
})
export class AppModule {}
