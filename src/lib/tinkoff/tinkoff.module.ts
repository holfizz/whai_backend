import { MailService } from "@/auth/mail.service";
import { PrismaService } from "@/prisma.service";
import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { TinkoffService } from "./tinkoff.service";

@Module({
  imports: [HttpModule],
  providers: [TinkoffService, MailService, PrismaService],
  exports: [TinkoffService, TinkoffModule],
})
export class TinkoffModule {}
