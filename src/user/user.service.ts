import { FileService, FileType } from "@/file/file.service";
import { PrismaService } from "@/prisma.service";
import { Injectable } from "@nestjs/common";
import { FileUpload } from "graphql-upload-ts";
import { UpdateUserInput } from "./dto/update-user.input";

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private readonly fileService: FileService,
  ) {}

  async byId(id: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
      });
      if (!user) {
        throw new Error("User not found");
      }

      const activeSubscription = await this.prisma.subscriptionHistory.findFirst({
        where: {
          userId: id,
          isActive: true,
          endedAt: { gte: new Date() },
        },
      });

      const subscriptionType = activeSubscription
        ? await this.prisma.subscription.findUnique({
            where: { type: activeSubscription.subscriptionType },
          })
        : null;

      return {
        ...user,
        activeSubscription: activeSubscription
          ? {
              type: activeSubscription.subscriptionType,
              price: activeSubscription.price,
              isActive: true,
              startedAt: activeSubscription.startedAt,
              endedAt: activeSubscription.endedAt,
              subscriptionDetails: subscriptionType
                ? {
                    price: subscriptionType.price,
                    annualDiscountRate: subscriptionType.annualDiscountRate,
                    courseLimitPerMonth: subscriptionType.courseLimitPerMonth,
                    lessonLimitPerCourse: subscriptionType.lessonLimitPerCourse,
                    additionalTitlesLimit: subscriptionType.additionalTitlesLimit,
                    hasBasicAnalytics: subscriptionType.hasBasicAnalytics,
                    hasAIAssistedHomework: subscriptionType.hasAIAssistedHomework,
                    hasFileUploadInChat: subscriptionType.hasFileUploadInChat,
                    hasImageGeneration: subscriptionType.hasImageGeneration,
                  }
                : null,
            }
          : null,
      };
    } catch (error) {
      throw error;
    }
  }

  async updateProfile(id: string, updateUserDto: UpdateUserInput, picture: FileUpload) {
    try {
      let avatarPath: string | undefined = undefined;

      if (picture) {
        avatarPath = this.fileService.createFile(FileType.IMAGE, picture);
      }

      const data = {
        ...updateUserDto,
        ...(avatarPath && { avatarPath }),
      };

      return this.prisma.user.update({
        where: {
          id: id,
        },
        data,
      });
    } catch (error) {
      throw error;
    }
  }
}
