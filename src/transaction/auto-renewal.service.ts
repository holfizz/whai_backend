import { TinkoffService } from "@/lib/tinkoff/tinkoff.service";
import { PrismaService } from "@/prisma.service";
import { Injectable } from "@nestjs/common";
import { TransactionService } from "./transaction.service";

@Injectable()
export class AutoRenewalService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tinkoff: TinkoffService,
    private readonly transactionService: TransactionService,
  ) {}

  // @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async autoRenewal() {
    // console.log("Running autoRenewal job");
    // // Получаем пользователей, у которых подписка истекает сегодня
    // const subscriptions = await this.prisma.subscriptionHistory.findMany({
    //   where: {
    //     endedAt: {
    //       lte: new Date(new Date().setHours(23, 59, 59, 999)),
    //     },
    //     user: {
    //       isAutoRenewal: true,
    //     },
    //   },
    //   include: {
    //     user: true,
    //   },
    // });
    // await Promise.all(
    //   subscriptions.map(async subscription => {
    //     const userId = subscription.userId;
    //     // Получаем последнюю транзакцию пользователя
    //     const lastTransaction = await this.prisma.transaction.findFirst({
    //       where: {
    //         userId,
    //         status: "CONFIRMED",
    //       },
    //       orderBy: {
    //         createdAt: "desc",
    //       },
    //     });
    //     if (!lastTransaction) {
    //       console.log(`No last transaction found for user ${userId}, cancelling auto-renewal`);
    //       return this.prisma.subscriptionHistory.update({
    //         where: {
    //           id: subscription.id,
    //         },
    //         data: {
    //           endedAt: new Date(),
    //         },
    //       });
    //     }
    //     const amount = lastTransaction.amount;
    //     try {
    //       // Создаем новый платеж
    //       const paymentResponse = await this.tinkoff.createPaymentBySavedCard({
    //         currency: "RUB",
    //         customerEmail: subscription.user.email,
    //         items: [
    //           {
    //             description: `Auto-renewal for subscription`,
    //             quantity: "1.00",
    //             amount: {
    //               value: amount,
    //               currency: "RUB",
    //             },
    //             vat_code: "1",
    //           },
    //         ],
    //         total: amount,
    //         paymentId: lastTransaction.paymentId,
    //       });
    //       const newTransaction = await this.transactionService.create({
    //         payment: paymentResponse,
    //         userId,
    //         months: 1,
    //       });
    //       // Обновляем историю подписок
    //       const newEndDate = new Date();
    //       newEndDate.setMonth(newEndDate.getMonth() + 1);
    //       await this.prisma.subscriptionHistory.create({
    //         data: {
    //           userId,
    //           subscriptionType: subscription.subscriptionType,
    //           price: amount,
    //           startedAt: new Date(),
    //           endedAt: newEndDate,
    //           paymentId: paymentResponse.id,
    //           paymentStatus: paymentResponse.status,
    //           paymentMethod: paymentResponse.payment_method.type,
    //         },
    //       });
    //     } catch (error) {
    //       console.error(`Error processing auto-renewal for user ${userId}:`, error);
    //       return this.prisma.subscriptionHistory.update({
    //         where: {
    //           id: subscription.id,
    //         },
    //         data: {
    //           endedAt: new Date(),
    //         },
    //       });
    //     }
    //   }),
    // );
  }
}
