import { PrismaService } from "@/prisma.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class ChatMembersService {
  constructor(private readonly prismaService: PrismaService) {}
  async enterChat(userId: number, chatId: number) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });

    const chat = await this.prismaService.chat.findUnique({
      where: { id: chatId },
    });

    if (!user || !chat) {
      throw new Error("User or chat not found");
    }

    await this.prismaService.chatMembers.create({
      data: {
        userId: userId,
        chatId: chatId,
      },
    });
  }
  async leaveChat(userId: number, chatId: number) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });

    const chat = await this.prismaService.chat.findUnique({
      where: { id: chatId },
    });

    if (!user || !chat) {
      throw new Error("User or chat not found");
    }

    const chatMember = await this.prismaService.chatMembers.findFirst({
      where: {
        userId: userId,
        chatId: chatId,
      },
    });

    if (!chatMember) {
      throw new Error("User is not a member of this chat");
    }

    await this.prismaService.chatMembers.delete({
      where: {
        id: chatMember.id,
      },
    });
  }
}
