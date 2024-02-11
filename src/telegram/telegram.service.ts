import { Ctx, On, Start, Update } from 'nestjs-telegraf';
import { Scenes, Telegraf } from 'telegraf';
import { ConfigService } from '@nestjs/config';
import { ChatService } from '@/chat/chat.service';
import { OggConverterService } from '@/ogg-converter/ogg-converter.service';

type MessageContext = Scenes.SceneContext;

interface TelegramMessage {
  voice: {
    duration: number;
    mime_type: string;
    file_id: string;
    file_unique_id: string;
    file_size: number;
  };
}

@Update()
export class TelegramService extends Telegraf<MessageContext> {
  constructor(
    private readonly configService: ConfigService,
    private readonly gtp: ChatService,
    private readonly ogg: OggConverterService,
  ) {
    super(configService.get('TELEGRAM_API'));
  }

  @Start()
  async onStart(@Ctx() ctx: MessageContext) {
    await ctx.replyWithHTML(`<b>Привет, @${ctx.from.username}!</b>

Добро пожаловать в мир языкового обучения с помощью нашего бота на основе ChatGPT.
Здесь ты можешь общаться с нашим умным помощником, который будет помогать тебе <b>улучшить знание языков.</b>
Не стесняйся задавать вопросы и учиться новому каждый день! 🌟
`);
  }

  @On('voice')
  async voiceMessage(@Ctx() ctx: Scenes.WizardContext): Promise<any> {
    try {
      const link = await ctx.telegram.getFileLink(
        (ctx.message as TelegramMessage).voice.file_id,
      );
      const userId = String(ctx.message.from.id);
      const oggPath = await this.ogg.create(link.href, userId);
      const mp3Path = await this.ogg.toMp3(oggPath, userId);
      return ctx.reply(mp3Path);
    } catch (e) {
      console.log(e);
    }
  }
}
