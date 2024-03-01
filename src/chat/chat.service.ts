import { PrismaService } from "@/prisma.service";
import { Injectable } from "@nestjs/common";
import { CreateChatInput } from "./dto/create-chat.input";
import { UpdateChatInput } from "./dto/update-chat.input";

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}
  async createChat(userId: number, dto: CreateChatInput) {
    try {
      return await this.prisma.chat.create({
        data: {
          ...dto,
          ownerId: userId,
        },
      });
    } catch (error) {
      throw new Error(`Error creating chat: ${error.message}`);
    }
  }
  async getAllChats(userId: number) {
    try {
      const chats = await this.prisma.chat.findMany({
        where: { ownerId: userId },
      });
      return chats;
    } catch (error) {
      throw new Error(`Error creating chat: ${error.message}`);
    }
  }

  async updateChat(userId: number, id: number, dto: UpdateChatInput) {
    return this.prisma.chat.update({
      where: {
        id,
        ownerId: userId,
      },
      data: dto,
    });
  }

  async deleteChat(userId: number, id: number) {
    return await this.prisma.chat.delete({
      where: {
        id,
        ownerId: userId,
      },
    });
  }

  async getAllMessages(userId: number, chatId: number) {
    const chat = await this.prisma.chat.findUnique({
      where: { id: chatId },
      select: {
        messages: {
          take: 20,
        },
        chatMembers: true,
      },
    });

    const isUserInChat = chat?.chatMembers.some(member => member.userId === userId);

    if (!isUserInChat) {
      throw new Error("Пользователь не является членом этого чата.");
    }

    return chat;
  }
}
