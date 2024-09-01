import { PrismaService } from "@/prisma.service";
import { TelegramService } from "@/telegram/telegram.service";
import { Injectable } from "@nestjs/common";
import { CreateNoticeInput } from "./dto/create-notice.input";

@Injectable()
export class NoticeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly telegramService: TelegramService,
  ) {}
  async createNotice(userId: string, noticeDto: CreateNoticeInput) {
    const notice = await this.prisma.notice.create({
      data: {
        ...noticeDto,
        userId,
      },
    });

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { telegramId: true },
    });

    // await this.telegramService.sendMessage(user.telegramId, notice.title, notice.description);
    return notice;
  }
}
