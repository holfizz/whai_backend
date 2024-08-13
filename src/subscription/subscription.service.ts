import { PrismaService } from "@/prisma.service";
import { ForbiddenException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { SubscriptionType } from "@prisma/client";
import { SubscriptionInput } from "./dto/create-subscription.input";

@Injectable()
export class SubscriptionService {
  constructor(private readonly prisma: PrismaService) {}

  async createSubscription(adminId: string, data: SubscriptionInput) {
    try {
      const admin = await this.prisma.user.findUnique({
        where: { id: adminId },
      });

      if (!admin || !admin.roles.includes("ADMIN")) {
        throw new ForbiddenException("Only administrators can create subscriptions");
      }

      // Создаем новую подписку
      return await this.prisma.subscription.create({
        data: {
          type: data.type,
          price: data.price,
          annualDiscountRate: data.annualDiscountRate,
          isAutoRenewal: data.isAutoRenewal,
          courseLimitPerMonth: data.courseLimitPerMonth,
          lessonLimitPerCourse: data.lessonLimitPerCourse,
          additionalTitlesLimit: data.additionalTitlesLimit,
          hasBasicAnalytics: data.hasBasicAnalytics,
          hasAIAssistedHomework: data.hasAIAssistedHomework,
          hasFileUploadInChat: data.hasFileUploadInChat,
          hasImageGeneration: data.hasImageGeneration,
        },
      });
    } catch (error) {
      console.error("Error creating subscription:", error);
      throw new InternalServerErrorException("Failed to create subscription");
    }
  }

  async getSubscriptionById(subscriptionId: string) {
    try {
      // Получаем подписку по идентификатору
      return await this.prisma.subscription.findUnique({
        where: { id: subscriptionId },
      });
    } catch (error) {
      console.error("Error fetching subscription by ID:", error);
      throw new InternalServerErrorException("Failed to fetch subscription by ID");
    }
  }

  async getSubscriptionByUserId(userId: string) {
    try {
      // Получаем текущую подписку пользователя
      return await this.prisma.user.findUnique({
        where: { id: userId },
        select: { currentSubscription: true },
      }).currentSubscription;
    } catch (error) {
      console.error("Error fetching subscription by user ID:", error);
      throw new InternalServerErrorException("Failed to fetch subscription by user ID");
    }
  }

  async updateSubscription(subscriptionId: string, data: Partial<SubscriptionInput>) {
    try {
      // Обновляем подписку
      return await this.prisma.subscription.update({
        where: { id: subscriptionId },
        data,
      });
    } catch (error) {
      console.error("Error updating subscription:", error);
      throw new InternalServerErrorException("Failed to update subscription");
    }
  }

  async activateSubscription(userId: string, subscriptionType: SubscriptionType) {
    try {
      // Находим выбранную подписку по типу
      const subscription = await this.prisma.subscription.findUnique({
        where: { type: subscriptionType },
      });

      if (!subscription) {
        throw new Error(`Subscription of type ${subscriptionType} not found.`);
      }

      // Завершаем текущую подписку пользователя, если есть
      await this.endCurrentSubscription(userId);

      const currentDate = new Date();
      const endDate = new Date(currentDate);
      endDate.setDate(currentDate.getDate() + 30); // Устанавливаем конечную дату на 30 дней вперёд

      // Создаем запись в истории подписок
      await this.prisma.subscriptionHistory.create({
        data: {
          userId: userId,
          subscriptionType: subscriptionType,
          price: subscription.price,
          startedAt: currentDate,
          endedAt: endDate,
        },
      });

      // Обновляем текущую подписку пользователя
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          currentSubscriptionId: subscription.id,
        },
      });

      // Получаем обновленного пользователя и его текущую подписку
      const updatedUser = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          currentSubscription: true, // Включаем текущую подписку пользователя
        },
      });

      if (!updatedUser) {
        throw new Error(`User with ID ${userId} not found.`);
      }

      return {
        userId: updatedUser.id,
        subscriptionType: subscription.type,
        subscriptionEndDate: endDate,
      };
    } catch (error) {
      console.error("Error activating subscription:", error);
      throw new InternalServerErrorException("Failed to activate subscription");
    }
  }

  async endCurrentSubscription(userId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { currentSubscription: true },
      });

      if (user?.currentSubscriptionId) {
        await this.prisma.subscriptionHistory.updateMany({
          where: {
            userId: userId,
            subscriptionType: user.currentSubscription.type,
            endedAt: null,
          },
          data: {
            endedAt: new Date(),
          },
        });
      }
    } catch (error) {
      console.error("Error ending current subscription:", error);
      throw new InternalServerErrorException("Failed to end current subscription");
    }
  }
}
