import { AuthModule } from "@/auth/auth.module";
import { MailService } from "@/auth/mail.service";
import { Module } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { TelegrafModule } from "nestjs-telegraf";
import { options } from "./telegram-config.factory";
import { TelegramService } from "./telegram.service";
import { PrismaService } from "@/prisma.service";

@Module({
  imports: [TelegrafModule.forRootAsync(options()), AuthModule],
  providers: [TelegramService, JwtService, MailService, PrismaService],
  exports: [TelegramService],
})
export class TelegramModule {}
