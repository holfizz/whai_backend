import { PrismaService } from '@/prisma.service';
import { Injectable } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';

@Injectable()
export class MessageService {
  constructor(private readonly prisma: PrismaService) {}
  async createMessage(userId: number, dto: CreateMessageDto) {
    try {
      return await this.prisma.message.create({
        data: {
          ...dto,
          userId,
        },
      });
    } catch (error) {
      throw new Error(`Error creating message: ${error.message}`);
    }
  }

  async updateMessage(userId: number, id: number, dto: UpdateMessageDto) {
    return await this.prisma.message.update({
      where: {
        id,
        userId,
      },
      data: dto,
    });
  }

  async deleteMessage(userId: number, id: number) {
    return await this.prisma.message.delete({
      where: {
        id,
        userId,
      },
    });
  }
}
