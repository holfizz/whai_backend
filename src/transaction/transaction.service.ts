import { TinkoffService } from "@/lib/tinkoff/tinkoff.service";
import { PrismaService } from "@/prisma.service";
import { BadRequestException, Injectable } from "@nestjs/common";
import { CreateTransactionDto } from "./dto/create-transaction.dto";
import { MakePaymentDto } from "./dto/make-payment.dto";
import { UpdateTransactionDto } from "./dto/update-transaction.dto";

@Injectable()
export class TransactionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tinkoff: TinkoffService,
  ) {}

  async makePayment(dto: MakePaymentDto, userId: string): Promise<any> {
    // Найти текущий тип подписки пользователя
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException("User not found.");
    }

    const subs = await this.prisma.subscription.findUnique({
      where: { type: user.currentSubscriptionType },
    });

    if (!subs) {
      throw new BadRequestException("Subscription not found.");
    }

    const amount = subs.price * dto.months;

    try {
      const paymentResponse = await this.tinkoff.createPayment(
        {
          subType: subs.type,
          Descriptions: `Subscription for ${dto.months} months`,
          userId,
        },
        userId,
      );

      await this.create({
        userId,
        months: dto.months,
        payment: {
          amount: {
            value: amount.toString(),
            currency: "RUB",
          },
          // id: paymentResponse.confirmationToken || "",
          id: "",
          status: "PENDING",
        },
      });

      // return {
      //   confirmationToken: paymentResponse.confirmationToken,
      // };
      return true;
    } catch (error) {
      console.error("Error making payment:", error.message || error);
      throw new BadRequestException("Error creating payment.");
    }
  }

  async create({ userId, months, payment }: CreateTransactionDto) {
    // return this.prisma.transaction.create({
    //   data: {
    //     months,
    //     amount: parseFloat(payment.amount.value),
    //     paymentId: payment.id,
    //     status: "PENDING",
    //     user: {
    //       connect: { id: userId },
    //     },
    //   },
    // });
  }

  async update({ transactionId, months, payment }: UpdateTransactionDto) {
    const updateData: Partial<CreateTransactionDto> = {
      months,
      // amount: payment ? parseFloat(payment.amount.value) : undefined,
      // paymentId: payment ? payment.id : undefined,
      // status: payment ? payment.status : undefined,
      // paymentMethod: payment ? payment.payment_method?.type : undefined, // Обновляем если paymentMethod присутствует
    };

    return this.prisma.transaction.update({
      where: { id: transactionId },
      data: updateData,
    });
  }
}
