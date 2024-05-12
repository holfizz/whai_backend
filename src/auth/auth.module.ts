import { getJwtConfig } from "@/config/jwt.config";
import { FileModule } from "@/file/file.module";
import { FileService } from "@/file/file.service";
import { PrismaService } from "@/prisma.service";
import { UserModule } from "@/user/user.module";
import { UserService } from "@/user/user.service";
import { MailerModule } from "@nestjs-modules/mailer";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { AuthResolver } from "./auth.resolver";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "./jwt.strategy";
import { MailService } from "./mail.service";

@Module({
  providers: [AuthService, PrismaService, JwtStrategy, ConfigService, UserService, MailService, FileService, AuthResolver],
  imports: [
    ConfigModule.forRoot(),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getJwtConfig,
    }),
    MailerModule.forRoot({
      transport: {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        ignoreTLS: false,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      },
    }),
    UserModule,
    FileModule,
  ],
  exports: [AuthService],
})
export class AuthModule {}
