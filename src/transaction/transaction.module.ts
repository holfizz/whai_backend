import { TinkoffModule } from "@/lib/tinkoff/tinkoff.module";
import { TinkoffService } from "@/lib/tinkoff/tinkoff.service";
import { PrismaService } from "@/prisma.service";
import { SubscriptionService } from "@/subscription/subscription.service";
import { MailerModule } from "@nestjs-modules/mailer";
import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TransactionMailService } from "./transaction-mail.service";
import { TransactionResolver } from "./transaction.resolver";
import { TransactionService } from "./transaction.service";
import { WebhookController } from "./webhook/webhook.controller";
import { WebhookService } from "./webhook/webhook.service";

@Module({
  controllers: [WebhookController],
  imports: [
    HttpModule,
    ConfigModule,
    TinkoffModule,
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
  ],
  providers: [PrismaService, TinkoffService, TransactionService, WebhookService, TransactionResolver, SubscriptionService, TransactionMailService],
})
export class TransactionModule {}
