import { PrismaService } from "@/prisma.service";
import { Injectable } from "@nestjs/common";
import { ChatWithAIInput } from "./dto/chat-with-ai.Input";
@Injectable()
export default class ChatWithAIService {
  constructor(private readonly prisma: PrismaService) {}
  async createChatWithAI(userId: string, dto: ChatWithAIInput) {
    try {
      const createChat = await this.prisma.chatWithAI.create({
        data: {
          ...dto,
          userId,
        },
      });
      return createChat;
    } catch (error) {
      throw new Error(`Error creating chat: ${error.message}`);
    }
  }
  async getAllChatsWithAi(userId: string) {
    try {
      const createChat = await this.prisma.chatWithAI.findMany({
        where: { userId },
      });
      return createChat;
    } catch (error) {
      throw new Error(`Error creating chat: ${error.message}`);
    }
  }
}
