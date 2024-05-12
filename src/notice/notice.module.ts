import { AuthService } from "@/auth/auth.service";
import { MailService } from "@/auth/mail.service";
import { PrismaService } from "@/prisma.service";
import { TelegramService } from "@/telegram/telegram.service";
import { Module } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { NoticeResolver } from "./notice.resolver";
import { NoticeService } from "./notice.service";

@Module({
  providers: [NoticeResolver, NoticeService, PrismaService, TelegramService, AuthService, JwtService, MailService],
})
export class NoticeModule {}
