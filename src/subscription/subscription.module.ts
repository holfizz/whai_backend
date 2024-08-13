import { PrismaService } from "@/prisma.service";
import { Module } from "@nestjs/common";
import { SubscriptionResolver } from "./subscription.resolver";
import { SubscriptionService } from "./subscription.service";
import { AutoRenewalService } from "./auto-renewal.service";

@Module({
  providers: [SubscriptionResolver, SubscriptionService, PrismaService, AutoRenewalService],
})
export class SubscriptionModule {}
