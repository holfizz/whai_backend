import { AuthService } from "@/auth/auth.service";
import { PrismaService } from "@/prisma.service";
import { ConfigService } from "@nestjs/config";
import { Ctx, Start, Update } from "nestjs-telegraf";
import { Context, Telegraf } from "telegraf";
import { SceneContext } from "telegraf/typings/scenes";
type MessageContext = Context & SceneContext;
@Update()
export class TelegramService extends Telegraf<MessageContext> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super(configService.get("TELEGRAM_KEY"));
  }
  @Start()
  async handleStartCommand(@Ctx() ctx) {
    const token = ctx.startPayload || ctx.message.text.split(" ")[1] || "";
    const telegramId = ctx.from.id.toString();
    if (!token) {
      const existingUser = await this.prisma.user.findUnique({
        where: { telegramId },
        select: { email: true },
      });

      if (existingUser) {
        return ctx.reply(`Ваш аккаунт уже привязан к Telegram! Электронная почта: ${String(existingUser.email)}`);
      } else {
        return ctx.reply("Не удалось обнаружить токен. Пожалуйста, используйте ссылку, предоставленную на сайте.");
      }
    }
    const authResult = await this.authService.handleTelegramAuth(token, telegramId);
    if (authResult.userEmail) {
      return ctx.reply(`Ваш аккаунт успешно привязан к Telegram! Электронная почта: ${String(authResult.userEmail)}`);
    } else {
      return ctx.reply("Не удалось привязать аккаунт. Пожалуйста, попробуйте еще раз.");
    }
  }
}
