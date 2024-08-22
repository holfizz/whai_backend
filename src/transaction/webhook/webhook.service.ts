import { INotificationBase } from "@/lib/tinkoff/types/tinkoff.types";
import { PrismaService } from "@/prisma.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class WebhookService {
  constructor(private readonly prisma: PrismaService) {}

  async tinkoff(dto: INotificationBase) {
    const transaction = await this.prisma.transaction.findFirst({ where: { id: dto.OrderId } });
    const subs = await this.prisma.subscription.findUnique({ where: { type: transaction.type } });
    if (!transaction) {
      throw new Error("Transaction not found");
    }

    if (dto.Success && transaction.userId) {
      await this.prisma.transaction.update({ where: { id: dto.OrderId }, data: { rebillId: dto.RebillId } });

      await this.prisma.subscriptionHistory.create({
        data: {
          user: {
            connect: { id: transaction.userId },
          },
          startedAt: new Date(),
          price: subs.price,
          subscriptionType: transaction.type,
          endedAt: new Date(new Date().setDate(new Date().getDate() + 30)),
          paymentId: transaction.rebillId,
          transactionId: transaction.id,
        },
      });

      return true;
    }

    return false;
  }

  private getEndDate(months: number): Date {
    return new Date(Date.now() + months * 30 * 24 * 60 * 60 * 1000);
  }
}
