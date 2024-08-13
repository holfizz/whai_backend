import { PrismaService } from "@/prisma.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class AutoRenewalService {
  constructor(private readonly prisma: PrismaService) {}

  // @Cron(CronExpression.EVERY_DAY_AT_3AM)
  // @Cron(CronExpression.EVERY_MINUTE)
  async handleCron() {
    try {
      console.log("Running auto-renewal process");

      const expiredSubscriptions = await this.prisma.subscriptionHistory.findMany({
        where: {
          endedAt: new Date().toISOString().slice(0, 10),
        },
      });

      // Завершаем подписки
      await Promise.all(
        expiredSubscriptions.map(async subscription => {
          await this.prisma.user.update({
            where: { id: subscription.userId },
            data: {
              currentSubscriptionId: null, // Убираем текущую подписку у пользователя
            },
          });
        }),
      );

      console.log("Auto-renewal process completed");
    } catch (error) {
      console.error("Error during auto-renewal:", error);
    }
  }
}
