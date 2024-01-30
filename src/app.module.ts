import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ServeStaticModule } from '@nestjs/serve-static'
import path from 'path';


@Module({
  imports: [ConfigModule.forRoot({
    envFilePath:".env"
  }),
    ServeStaticModule.forRoot({
      rootPath: `${path}/uploads`,
      serveRoot: '/uploads',
    }),
    ConfigModule.forRoot(),
    AuthModule,
    ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

