import { PrismaService } from '@/prisma.service';
import { Injectable } from '@nestjs/common';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}
  async createChat(userId: number, dto: CreateChatDto) {
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
      return await this.prisma.chat.findMany({
        where: { ownerId: userId },
      });
    } catch (error) {
      throw new Error(`Error creating chat: ${error.message}`);
    }
  }

  async updateChat(userId: number, id: number, dto: UpdateChatDto) {
    return await this.prisma.chat.update({
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
}
