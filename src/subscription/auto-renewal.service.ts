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
      const now = new Date();
      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);

      // Fetch active subscriptions
      const activeSubscriptions = await this.prisma.subscriptionHistory.findMany({
        where: {
          isActive: true,
        },
        include: {
          user: true,
        },
      });

      await Promise.all(
        activeSubscriptions.map(async subscription => {
          const user = subscription.user;

          // Check if the subscription has expired
          if (subscription.endedAt && subscription.endedAt < now) {
            logger.log(`Subscription for user ${user.id} has expired, checking auto-renewal status`);

            // Check if auto-renewal is enabled
            if (!user.isAutoRenewal) {
              logger.log(`User ${user.id} has auto-renewal disabled, cancelling subscription`);

              // Mark the subscription as inactive
              await this.prisma.subscriptionHistory.update({
                where: {
                  id: subscription.id,
                },
                data: {
                  isActive: false,
                },
              });
              return;
            }

            // Auto-renewal is enabled, attempt to renew
            logger.log(`Auto-renewal is enabled for user ${user.id}, attempting to renew subscription`);

            // Fetch the last confirmed or rejected transaction
            const lastTransaction = await this.prisma.transaction.findFirst({
              where: {
                userId: user.id,
              },
              orderBy: {
                createdAt: "desc",
              },
            });

            if (!lastTransaction) {
              logger.log(`No recent transaction found for user ${user.id}, cancelling auto-renewal`);
              await this.prisma.subscriptionHistory.update({
                where: {
                  id: subscription.id,
                },
                data: {
                  isActive: false,
                },
              });
              return;
            }

            // Check the status of the last transaction
            if (lastTransaction.status === "REJECTED") {
              logger.log(`Last transaction for user ${user.id} was rejected, disabling auto-renewal`);

              // Disable auto-renewal and mark subscription as inactive
              await this.prisma.user.update({
                where: { id: user.id },
                data: { isAutoRenewal: false },
              });

              await this.prisma.subscriptionHistory.update({
                where: {
                  id: subscription.id,
                },
                data: {
                  isActive: false,
                },
              });

              return;
            }

            try {
              const paymentData = {
                TerminalKey: process.env.TBANK_TERMINAL,
                PaymentId: String(lastTransaction.paymentId),
                RebillId: String(lastTransaction.rebillId),
                Amount: lastTransaction.amount,
              };
              logger.log(paymentData);
              const Token = this.tinkoffService.generateToken(paymentData);
              const paymentResponse = await this.tinkoffService.requestCharge({ ...paymentData, Token }, "Charge");

              const newTransaction = await this.prisma.transaction.create({
                data: {
                  user: { connect: { id: user.id } },
                  amount: paymentResponse.Amount,
                  months: 1,
                  type: subscription.subscriptionType,
                  paymentId: paymentResponse.PaymentId,
                  orderId: paymentResponse.OrderId,
                  status: "CONFIRMED",
                },
              });

              const newEndDate = new Date(now);
              newEndDate.setMonth(newEndDate.getMonth() + 1);

              // Update the current subscription's end date and reactivate it
              await this.prisma.subscriptionHistory.update({
                where: {
                  id: subscription.id,
                },
                data: {
                  endedAt: newEndDate,
                  transactionId: newTransaction.id,
                  paymentId: paymentResponse.PaymentId,
                  isActive: true, // Reactivate the subscription as it's renewed
                },
              });

              logger.log(`Successfully renewed subscription for user ${user.id} until ${newEndDate.toISOString()}`);
            } catch (error) {
              logger.error(`Error processing auto-renewal for user ${user.id}:`, error);

              // Mark subscription as inactive in case of any other errors
              await this.prisma.subscriptionHistory.update({
                where: {
                  id: subscription.id,
                },
                data: {
                  isActive: false,
                },
              });

              logger.log(`Failed to renew subscription for user ${user.id}, subscription cancelled`);
            }
          } else {
            logger.log(`Subscription for user ${user.id} is still active, no action needed`);
          }
        }),
      );

      logger.log("Auto-renewal process completed");
    } catch (error) {
      logger.error("Error during auto-renewal:", error);
    }
  }
}
