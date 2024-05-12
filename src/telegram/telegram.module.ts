import { AuthModule } from "@/auth/auth.module";
import { AuthService } from "@/auth/auth.service";
import { MailService } from "@/auth/mail.service";
import { PrismaService } from "@/prisma.service";
import { Module } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { TelegrafModule } from "nestjs-telegraf";
import { options } from "./telegram-config.factory";
import { TelegramService } from "./telegram.service";

@Module({
  imports: [TelegrafModule.forRootAsync(options()), AuthModule],
  providers: [TelegramService, PrismaService, AuthService, MailService, JwtService],
  exports: [TelegramService],
})
export class TelegramModule {}
