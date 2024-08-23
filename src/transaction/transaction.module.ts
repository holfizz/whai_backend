import { TinkoffService } from "@/lib/tinkoff/tinkoff.service";
import { PrismaService } from "@/prisma.service";
import { SubscriptionService } from "@/subscription/subscription.service";
import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AutoRenewalService } from "./auto-renewal.service";
import { TransactionResolver } from "./transaction.resolver";
import { TransactionService } from "./transaction.service";
import { WebhookController } from "./webhook/webhook.controller";
import { WebhookService } from "./webhook/webhook.service";

@Module({
  controllers: [WebhookController],
  imports: [HttpModule, ConfigModule],
  providers: [PrismaService, AutoRenewalService, TinkoffService, TransactionService, WebhookService, TransactionResolver, SubscriptionService],
})
export class TransactionModule {}
