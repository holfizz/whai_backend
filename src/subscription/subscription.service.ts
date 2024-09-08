import { PrismaService } from "@/prisma.service";
import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { SubscriptionType } from "@prisma/client";
import { ActivateDto, SubscriptionInput } from "./dto/create-subscription.input";

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

      return await this.prisma.subscription.create({
        data: {
          type: data.type,
          price: data.price,
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

  async getSubscriptionById(subscriptionType: SubscriptionType) {
    try {
      return await this.prisma.subscription.findUnique({
        where: { type: subscriptionType },
      });
    } catch (error) {
      console.error("Error fetching subscription by ID:", error);
      throw new InternalServerErrorException("Failed to fetch subscription by ID");
    }
  }

  async getSubscriptionByUserId(userId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { currentSubscription: true },
      });
      return user?.currentSubscription;
    } catch (error) {
      console.error("Error fetching subscription by user ID:", error);
      throw new InternalServerErrorException("Failed to fetch subscription by user ID");
    }
  }

  async updateSubscription(subscriptionType: SubscriptionType, data: Partial<SubscriptionInput>) {
    try {
      return await this.prisma.subscription.update({
        where: { type: subscriptionType },
        data,
      });
    } catch (error) {
      console.error("Error updating subscription:", error);
      throw new InternalServerErrorException("Failed to update subscription");
    }
  }

  async activateSubscription(userId: string, dto: ActivateDto) {
    try {
      const subscription = await this.prisma.subscription.findUnique({
        where: { type: dto.subscriptionType },
      });

      if (!subscription) {
        throw new Error(`Subscription of type ${dto.subscriptionType} not found.`);
      }

      // await this.endCurrentSubscription(userId);
      const updatedUser = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          currentSubscription: true,
        },
      });

      if (!updatedUser) {
        throw new Error(`User with ID ${userId} not found.`);
      }

      const currentDate = new Date();
      const endDate = new Date(currentDate);
      endDate.setMonth(currentDate.getMonth() + dto.months);

      await this.prisma.subscriptionHistory.create({
        data: {
          user: { connect: { id: userId } },
          subscriptionType: dto.subscriptionType,
          price: subscription.price,
          email: updatedUser.email,
          startedAt: currentDate,
          endedAt: endDate,
          transactionId: dto.transactionId,
          paymentId: String(dto.paymentId),
        },
      });

      await this.prisma.user.update({
        where: { id: userId },
        data: {
          currentSubscriptionType: dto.subscriptionType,
        },
      });

      return {
        userId: updatedUser.id,
        subscriptionType: dto.subscriptionType,
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

      if (user?.currentSubscriptionType) {
        await this.prisma.subscriptionHistory.updateMany({
          where: {
            userId: userId,
            subscriptionType: user.currentSubscriptionType,
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
  async activateTrialSubscription(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    if (user.isTrialUsed) {
      throw new BadRequestException("Trial subscription has already been used and cannot be activated again");
    }

    if (user.isTrial) {
      throw new BadRequestException("Trial subscription is already active");
    }

    const trialDurationDays = 3;
    const currentDate = new Date();
    const endDate = new Date(currentDate);
    endDate.setMonth(currentDate.getDay() + trialDurationDays);

    const trialEndDate = new Date(currentDate);
    trialEndDate.setDate(currentDate.getDate() + trialDurationDays);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        isTrial: true,
        trialEndsAt: trialEndDate,
        isTrialUsed: true,
        currentCourseCount: 2,
        currentLessonCount: 10,
        additionalTitlesCount: 20,
      },
    });

    return true;
  }
}
