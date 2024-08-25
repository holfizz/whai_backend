import logger from "@/helpers/logger";
import { TinkoffNotificationDto } from "@/lib/tinkoff/types/tinkoff.types";
import { PrismaService } from "@/prisma.service";
import { SubscriptionService } from "@/subscription/subscription.service";
import { Injectable } from "@nestjs/common";
import { TransactionMailService } from "../transaction-mail.service";

@Injectable()
export class WebhookService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly subscriptionService: SubscriptionService,
    private readonly mailService: TransactionMailService,
  ) {}

  async tinkoff(dto: TinkoffNotificationDto): Promise<string> {
    console.log("LOOOOOG");
    console.log(dto);
    const transaction = await this.prisma.transaction.findFirst({
      where: { id: dto.OrderId },
    });

    if (!transaction) {
      logger.error("Transaction not found");
      throw new Error("Transaction not found");
    }

    switch (dto.Status) {
      case "AUTHORIZED":
        logger.log(`Payment authorized for OrderId: ${dto.OrderId}`);
        break;
      case "CONFIRMED":
        logger.log(`Payment confirmed for OrderId: ${dto.OrderId}`);
        await this.prisma.transaction.update({
          where: { orderId: dto.OrderId },
          data: { status: "CONFIRMED", rebillId: dto.RebillId, paymentId: String(dto.PaymentId) },
        });
        const userId = transaction.userId;
        if (!userId) {
          throw new Error("User ID not found in transaction");
        }

        await this.subscriptionService.activateSubscription(userId, {
          transactionId: transaction.id,
          subscriptionType: transaction.type,
          paymentId: dto.PaymentId,
          months: transaction.months,
        });
        const user = await this.prisma.user.findUnique({ where: { id: userId } });

        if (user) {
          await this.mailService.sendInvoiceMail({
            to: user.email,
            amount: String(transaction.amount),
            months: transaction.months,
            subscriptionType: transaction.type,
            date: new Date().toISOString().split("T")[0],
            name: user.firstName,
            autoRenew: user.isAutoRenewal,
          });
        } else {
          logger.error(`User with id ${userId} not found`);
        }
        break;
      case "REVERSED":
        logger.log(`Payment reversed for OrderId: ${dto.OrderId}`);
        await this.prisma.transaction.update({
          where: { orderId: dto.OrderId },
          data: { status: "REVERSED" },
        });
        break;
      case "REFUNDED":
        logger.log(`Payment refunded for OrderId: ${dto.OrderId}`);
        await this.prisma.transaction.update({
          where: { orderId: dto.OrderId },
          data: { status: "REFUNDED" },
        });
        break;
      case "REJECTED":
        logger.error(`Payment rejected for OrderId: ${dto.OrderId}`);
        await this.prisma.transaction.update({
          where: { orderId: dto.OrderId },
          data: { status: "REJECTED" },
        });
        break;
      default:
        logger.warn(`Unhandled payment status: ${dto.Status} for OrderId: ${dto.OrderId}`);
    }

    return "Ok";
  }
}
