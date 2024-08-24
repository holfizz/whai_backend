import { TinkoffModule } from "@/lib/tinkoff/tinkoff.module";
import { TinkoffService } from "@/lib/tinkoff/tinkoff.service";
import { PrismaService } from "@/prisma.service";
import { TransactionService } from "@/transaction/transaction.service";
import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { AutoRenewalService } from "./auto-renewal.service";
import { SubscriptionResolver } from "./subscription.resolver";
import { SubscriptionService } from "./subscription.service";

@Module({
  imports: [HttpModule, TinkoffModule],
  providers: [SubscriptionResolver, SubscriptionService, PrismaService, AutoRenewalService, TinkoffService, TransactionService],
})
export class SubscriptionModule {}
