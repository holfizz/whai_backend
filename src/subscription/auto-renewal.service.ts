import logger from "@/helpers/logger";
import { TinkoffService } from "@/lib/tinkoff/tinkoff.service";
import { PrismaService } from "@/prisma.service";
import { SubscriptionService } from "@/subscription/subscription.service";
import { TransactionService } from "@/transaction/transaction.service";
import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";

@Injectable()
export class AutoRenewalService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tinkoffService: TinkoffService,
    private readonly transactionService: TransactionService,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  @Cron(process.env.NODE_ENV === "development" ? CronExpression.EVERY_MINUTE : CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCron() {
    logger.log("Running auto-renewal process");

    try {
      // Fetch subscriptions that are expiring today
      const expiredSubscriptions = await this.prisma.subscriptionHistory.findMany({
        where: {
          endedAt: {
            lte: new Date(),
            gte: new Date(new Date().setHours(23, 59, 59, 999)),
            not: null,
          },
        },
        include: {
          user: true,
        },
      });

      await Promise.all(
        expiredSubscriptions.map(async subscription => {
          const user = subscription.user;
          if (!user.isAutoRenewal) {
            logger.log(`User ${user.id} has auto-renewal disabled, skipping renewal`);
            return;
          }

          // Fetch the last confirmed transaction
          const lastTransaction = await this.prisma.transaction.findFirst({
            where: {
              userId: user.id,
              status: "CONFIRMED",
            },
            orderBy: {
              createdAt: "desc",
            },
          });

          if (!lastTransaction) {
            logger.log(`No confirmed transaction found for user ${user.id}, cancelling auto-renewal`);
            return this.prisma.subscriptionHistory.update({
              where: {
                id: subscription.id,
              },
              data: {
                endedAt: new Date(),
              },
            });
          }

          try {
            // Prepare payment details
            const paymentData = {
              PaymentId: lastTransaction.paymentId,
              RebillId: lastTransaction.rebillId,
              Amount: lastTransaction.amount,
            };

            const paymentResponse = await this.tinkoffService.requestCharge(paymentData, "/Charge");

            const newTransaction = await this.prisma.transaction.create({
              data: {
                user: { connect: { id: user.id } },
                amount: paymentResponse.Amount,
                months: 1,
                type: subscription.subscriptionType,
                paymentId: paymentResponse.PaymentId,
              },
            });

            const newEndDate = new Date();
            newEndDate.setMonth(newEndDate.getMonth() + 1);

            // Update subscription history with new entry
            await this.prisma.subscriptionHistory.create({
              data: {
                user: { connect: { id: newTransaction.userId } },
                subscriptionType: subscription.subscriptionType,
                price: lastTransaction.amount,
                startedAt: new Date(),
                endedAt: newEndDate,
                transactionId: newTransaction.id,
                paymentId: paymentResponse.PaymentId,
              },
            });

            logger.log(`Successfully renewed subscription for user ${user.id}`);
          } catch (error) {
            logger.error(`Error processing auto-renewal for user ${user.id}:`, error);
            await this.prisma.subscriptionHistory.update({
              where: {
                id: subscription.id,
              },
              data: {
                endedAt: new Date(),
              },
            });
          }
        }),
      );

      logger.log("Auto-renewal process completed");
    } catch (error) {
      logger.error("Error during auto-renewal:", error);
    }
  }
}
