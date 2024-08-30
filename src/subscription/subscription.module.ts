import { TinkoffModule } from "@/lib/tinkoff/tinkoff.module";
import { TinkoffService } from "@/lib/tinkoff/tinkoff.service";
import { PrismaService } from "@/prisma.service";
import { TransactionService } from "@/transaction/transaction.service";
import { MailerModule } from "@nestjs-modules/mailer";
import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { AutoRenewalService } from "./auto-renewal.service";
import { SubscriptionNotificationService } from "./subscription-notification.service";
import { SubscriptionResolver } from "./subscription.resolver";
import { SubscriptionService } from "./subscription.service";

@Module({
  imports: [
    HttpModule,
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
  providers: [SubscriptionResolver, SubscriptionService, PrismaService, AutoRenewalService, TinkoffService, TransactionService, SubscriptionNotificationService],
})
export class SubscriptionModule {}
