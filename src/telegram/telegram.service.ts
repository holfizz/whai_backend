import { Ctx, On, Start, Update } from 'nestjs-telegraf';
import { Scenes, Telegraf } from 'telegraf';
import { ConfigService } from '@nestjs/config';
import { OggConverterService } from '@/ogg-converter/ogg-converter.service';
import { OpenaiService } from '@/openai/openai.service';
import { bold } from 'telegraf/format';

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
    private readonly ogg: OggConverterService,
    private readonly openai: OpenaiService,
  ) {
    super(configService.get('TELEGRAM_KEY'));
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
      await ctx.reply(bold('Принято! 😊 Жду ответа от сервера. 🤖'));
      const link = await ctx.telegram.getFileLink(
        (ctx.message as TelegramMessage).voice.file_id,
      );
      const userId = String(ctx.message.from.id);
      const oggPath = await this.ogg.create(link.href, userId);
      const response = await this.openai.transcription(oggPath);
      await ctx.replyWithHTML(
        `<b>Ваш запрос: </b><span class="tg-spoiler">${response}</span>`,
      );
    } catch (e) {
      console.log(e);
    }
  }
}
