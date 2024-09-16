import logger from "@/helpers/logger";
import { TinkoffService } from "@/lib/tinkoff/tinkoff.service";
import { PrismaService } from "@/prisma.service";
import { SubscriptionService } from "@/subscription/subscription.service";
import { TransactionService } from "@/transaction/transaction.service";
import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { SubscriptionNotificationService } from "./subscription-notification.service";
@Injectable()
export class AutoRenewalService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tinkoffService: TinkoffService,
    private readonly transactionService: TransactionService,
    private readonly subscriptionService: SubscriptionService,
    private readonly subscriptionNotificationService: SubscriptionNotificationService,
  ) {}

  @Cron(process.env.NODE_ENV === "development" ? CronExpression.EVERY_10_SECONDS : CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCron() {
    try {
      const now = new Date();

      const activeSubscriptions = await this.prisma.subscriptionHistory.findMany({
        where: { isActive: true },
        include: { user: true },
      });

      await Promise.all(
        activeSubscriptions.map(async subscription => {
          const user = await this.prisma.user.findUnique({
            where: { id: subscription.userId },
          });

          if (!user) throw new Error(`User with id ${subscription.userId} not found`);

          const lastTransaction = await this.prisma.transaction.findFirst({
            where: {
              userId: user.id,
              rebillId: { not: null },
            },
            orderBy: { createdAt: "desc" },
          });

          if (subscription.endedAt && subscription.endedAt < now) {
            logger.log(`Subscription for user ${user.id} has expired`);

            // Если автообновление отключено
            if (!user.isAutoRenewal) {
              logger.log(`Auto-renewal is disabled for user ${user.id}, deactivating subscription`);

              // Отключить подписку
              await this.prisma.subscriptionHistory.update({
                where: { id: subscription.id },
                data: { isActive: false },
              });
              await this.prisma.user.update({
                where: { id: user.id },
                data: {
                  currentCourseCount: 0,
                  currentLessonCount: 0,
                  additionalTitlesCount: 0,
                },
              });
              return;
            }

            // Если автообновление включено, но нет транзакции
            if (!lastTransaction) {
              logger.log(`No last transaction found for user ${user.id}, deactivating subscription`);
              await this.prisma.subscriptionHistory.update({
                where: { id: subscription.id },
                data: { isActive: false },
              });
              await this.prisma.user.update({
                where: { id: user.id },
                data: {
                  currentCourseCount: 0,
                  currentLessonCount: 0,
                  additionalTitlesCount: 0,
                },
              });
              return;
            }

            // Если последняя транзакция была отклонена
            if (lastTransaction.status === "REJECTED") {
              logger.log(`Last transaction was rejected, disabling auto-renewal for user ${user.id}`);
              await this.prisma.user.update({
                where: { id: user.id },
                data: { isAutoRenewal: false },
              });
              await this.prisma.subscriptionHistory.update({
                where: { id: subscription.id },
                data: { isActive: false },
              });
              await this.prisma.user.update({
                where: { id: user.id },
                data: {
                  currentCourseCount: 0,
                  currentLessonCount: 0,
                  additionalTitlesCount: 0,
                },
              });
              return;
            }

            // Отключаем предыдущую подписку
            await this.prisma.subscriptionHistory.update({
              where: { id: subscription.id },
              data: { isActive: false },
            });
            await this.prisma.user.update({
              where: { id: user.id },
              data: {
                currentCourseCount: 0,
                currentLessonCount: 0,
                additionalTitlesCount: 0,
              },
            });
            // Произвести оплату
            logger.log(`Processing auto-renewal for user ${user.id}`);

            const paymentCreate = await this.tinkoffService.createPayment(
              {
                subType: lastTransaction.type,
                Descriptions: `Subscription for ${lastTransaction.months} months`,
                userId: user.id,
                totalAmount: lastTransaction.amount,
                months: lastTransaction.months,
              },
              user.id,
              true,
            );

            const paymentData = {
              TerminalKey: process.env.TBANK_TERMINAL,
              PaymentId: Number(paymentCreate.PaymentId),
              RebillId: String(lastTransaction.rebillId),
            };

            const Token = this.tinkoffService.generateToken(paymentData);
            const paymentResponse = await this.tinkoffService.requestCharge({ ...paymentData, Token }, "Charge");

            if (paymentResponse.Status !== "CONFIRMED") {
              logger.log(`Payment failed for user ${user.id}, deactivating subscription`);
              await this.prisma.subscriptionHistory.update({
                where: { id: subscription.id },
                data: { isActive: false },
              });
              await this.prisma.user.update({
                where: { id: user.id },
                data: { isAutoRenewal: false },
              });
              await this.prisma.user.update({
                where: { id: user.id },
                data: {
                  currentCourseCount: 0,
                  currentLessonCount: 0,
                  additionalTitlesCount: 0,
                },
              });
              return;
            }

            const newTransaction = await this.prisma.transaction.update({
              where: {
                orderId: paymentResponse.OrderId,
              },
              data: {
                user: { connect: { id: user.id } },
                amount: lastTransaction.amount,
                months: lastTransaction.months,
                type: subscription.subscriptionType,
                paymentId: paymentResponse.PaymentId,
                status: "CONFIRMED",
              },
            });

            // Создаем новую подписку
            const newEndDate = new Date(now);
            newEndDate.setMonth(newEndDate.getMonth() + lastTransaction.months);

            // await this.prisma.subscriptionHistory.create({
            //   data: {
            //     user: { connect: { id: user.id } },
            //     startedAt: new Date(now),
            //     endedAt: newEndDate,
            //     transactionId: newTransaction.id,
            //     paymentId: paymentResponse.PaymentId,
            //     isActive: true,
            //     subscriptionType: subscription.subscriptionType,
            //     price: subscription.price,
            //   },
            // });

            logger.log(`Subscription successfully renewed for user ${user.id} until ${newEndDate.toISOString()}`);
          }
        }),
      );
    } catch (error) {
      logger.error("Error during auto-renewal:", error);
    }
  }

  @Cron(process.env.NODE_ENV === "production" ? CronExpression.EVERY_DAY_AT_NOON : CronExpression.EVERY_YEAR)
  // @Cron(CronExpression.EVERY_MINUTE)
  async notifyUsersBeforeExpiration() {
    logger.log("Running notification process for upcoming subscription renewals");

    try {
      const now = new Date();
      const threeDaysFromNow = new Date(now);
      threeDaysFromNow.setDate(now.getDate() + 3);

      // Получаем активные подписки, у которых срок окончания через 3 дня
      const subscriptionsToNotify = await this.prisma.subscriptionHistory.findMany({
        where: {
          isActive: true,
          endedAt: {
            lte: threeDaysFromNow,
          },
        },
        include: {
          user: true,
        },
      });

      await Promise.all(
        subscriptionsToNotify.map(async subscription => {
          const user = subscription.user;

          logger.log(`Sending notification to user ${user.id} about upcoming subscription renewal`);

          try {
            // Отправка уведомления пользователю
            await this.subscriptionNotificationService.sendExpirationReminder({
              to: user.email,
              name: user.firstName,
              subscriptionType: subscription.subscriptionType,
              endDate: subscription.endedAt.toISOString(),
            });

            logger.log(`Notification sent to user ${user.id} for subscription ending on ${subscription.endedAt.toISOString()}`);
          } catch (error) {
            logger.error(`Error sending notification to user ${user.id}:`, error);
          }
        }),
      );

      logger.log("Notification process completed");
    } catch (error) {
      logger.error("Error during notification process:", error);
    }
  }

  @Cron(process.env.NODE_ENV === "development" ? CronExpression.EVERY_YEAR : CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async deactivateTrialSubscriptions() {
    const now = new Date();
    const oneDayFromNow = new Date(now);
    oneDayFromNow.setDate(now.getDate() + 1);

    const trialUsers = await this.prisma.user.findMany({
      where: {
        isTrial: true,
        trialEndsAt: { lte: now },
      },
    });

    const usersToNotify = await this.prisma.user.findMany({
      where: {
        isTrial: true,
        trialEndsAt: {
          lte: oneDayFromNow,
          gt: now,
        },
      },
    });

    await Promise.all(
      usersToNotify.map(async user => {
        await this.subscriptionNotificationService.sendTrialExpirationReminder({
          to: user.email,
          name: user.firstName,
          endDate: oneDayFromNow.toISOString(),
          isTrialEndingSoon: true,
        });

        console.log(`Notification sent to user ${user.id} about trial ending soon on ${oneDayFromNow.toISOString()}`);
      }),
    );

    await Promise.all(
      trialUsers.map(async user => {
        await this.prisma.user.update({
          where: { id: user.id },
          data: {
            isTrial: false,
            trialEndsAt: null,
            currentCourseCount: 0,
            currentLessonCount: 0,
            additionalTitlesCount: 0,
          },
        });

        await this.subscriptionNotificationService.sendTrialExpirationReminder({
          to: user.email,
          name: user.firstName,
          endDate: now.toISOString(),
          isTrialEndingSoon: false,
        });

        console.log(`Trial subscription for user ${user.id} has expired and has been deactivated.`);
      }),
    );
  }
}
