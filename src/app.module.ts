import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ChatGptModule } from './chat-gpt/chat-gpt.module';
import { UserModule } from '@/user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    ConfigModule.forRoot(),
    AuthModule,
    ChatGptModule,
    UserModule,
  ],
})
export class AppModule {}
