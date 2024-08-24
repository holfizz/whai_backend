import logger from "@/helpers/logger";
import { TinkoffService } from "@/lib/tinkoff/tinkoff.service";
import { PrismaService } from "@/prisma.service";
import { BadRequestException, Injectable } from "@nestjs/common";
import { MakePaymentDto } from "./dto/make-payment.dto";

@Injectable()
export class TransactionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tinkoff: TinkoffService,
  ) {}

  async makePayment(dto: MakePaymentDto, userId: string): Promise<any> {
    const user = await this.prisma.user.update({ where: { id: userId }, data: { isAutoRenewal: dto.isAutoRenewal } });
    if (!user) {
      throw new BadRequestException("User not found.");
    }
    const subs = await this.prisma.subscription.findUnique({
      where: { type: dto.subscriptionType },
    });
    if (!subs) {
      throw new BadRequestException("Subscription not found.");
    }
    let totalAmount = subs.price * dto.months;

    if (dto.months === 12) {
      const discount = 0.2;
      totalAmount = totalAmount * (1 - discount);
    }
    try {
      const paymentResponse = await this.tinkoff.createPayment(
        {
          subType: subs.type,
          Descriptions: `Subscription for ${dto.months} months`,
          userId,
          totalAmount,
          months: dto.months,
        },
        userId,
      );
      logger.log(paymentResponse);
      if (!paymentResponse.Success) {
        throw Error("Error creating payment by T-BANK.");
      }
      return {
        paymentUrl: paymentResponse.PaymentURL,
      };
    } catch (error) {
      logger.error("Error making payment:", error.message || error);
      throw new BadRequestException("Error creating payment.", error);
    }
  }
}
