import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import path from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
    ServeStaticModule.forRoot({
      rootPath: `${path}/uploads`,
      serveRoot: '/uploads',
    }),
    ConfigModule.forRoot(),
    AuthModule,
  ],
})
export class AppModule {}
