import { PrismaService } from "@/prisma.service";
import { BadRequestException, Injectable } from "@nestjs/common";
import { CreateMessageInput } from "./dto/create-message.input";
import { UpdateMessageInput } from "./dto/update-message.input";

@Injectable()
export class MessageService {
  constructor(private readonly prisma: PrismaService) {}

  async createMessage(userId: string, dto: CreateMessageInput) {
    try {
      const createMessage = await this.prisma.message.create({
        data: {
          ...dto,
          userId,
        },
      });
      if (!createMessage) {
        throw new BadRequestException("Сообщение не найдено");
      }
      return createMessage;
    } catch (error) {
      throw new BadRequestException(`Ошибка при создании сообщения: ${error.message}`);
    }
  }

  async updateMessage(userId: string, id: string, dto: UpdateMessageInput) {
    try {
      const updateMessage = await this.prisma.message.update({
        where: {
          id,
          userId,
        },
        data: dto,
      });
      if (!updateMessage) {
        throw new BadRequestException("Сообщение не найдено");
      }
      return updateMessage;
    } catch (error) {
      throw new BadRequestException(`Ошибка при обновлении сообщения: ${error.message}`);
    }
  }

  async deleteMessage(userId: string, id: string) {
    try {
      const deleteMessage = await this.prisma.message.delete({
        where: {
          id,
          userId,
        },
      });
      if (!deleteMessage) {
        throw new BadRequestException("Сообщение не найдено");
      }
      return deleteMessage;
    } catch (error) {
      throw new BadRequestException(`Ошибка при удалении сообщения: ${error.message}`);
    }
  }
}
