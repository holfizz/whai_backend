import { Command, Ctx, On, Start, Update } from 'nestjs-telegraf';
import { Context, Telegraf } from 'telegraf';
import { ConfigService } from '@nestjs/config';
import { OggConverterService } from '@/ogg-converter/ogg-converter.service';
import { OpenAIRoles, OpenaiService } from '@/openai/openai.service';
import { bold } from 'telegraf/format';
import { SceneContext } from 'telegraf/typings/scenes';

// Определяем интерфейс для сессии бота

type init_session_type = { messages: any[] };

type MessageContext = Context & { session: init_session_type } & SceneContext;

interface TelegramMessage {
  voice: {
    duration: number;
    mime_type: string;
    file_id: string;
    file_unique_id: string;
    file_size: number;
  };
}

const INITIAL_SESSION: init_session_type = {
  messages: [],
};

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

  @Command('deletecontext')
  async newContext(@Ctx() ctx: MessageContext) {
    ctx.session = {
      messages: [],
    };
    await ctx.reply(
      bold(
        '🧹Контекст отчищен. По умолчанию, бот учитывает контекст предыдущего вопроса и свой собственный ответ',
      ),
    );
  }

  @On('voice')
  async voiceMessage(@Ctx() ctx: MessageContext): Promise<any> {
    ctx.session = INITIAL_SESSION;
    try {
      await ctx.reply(bold('Принято! 😊 Жду ответа от сервера. 🤖'));
      const link = await ctx.telegram.getFileLink(
        (ctx.message as TelegramMessage).voice.file_id,
      );
      const userId = String(ctx.message.from.id);
      const oggPath = await this.ogg.create(link.href, userId);

      const text = await this.openai.transcription(oggPath);
      await ctx.replyWithHTML(
        `<b>Ваш запрос: </b><span class="tg-spoiler">${text}</span>`,
      );

      ctx.session.messages.push({ role: OpenAIRoles.USER, content: text });
      const response = await this.openai.chat(ctx.session.messages);
      ctx.session.messages.push({
        role: OpenAIRoles.ASSISTANT,
        content: response.content,
      });

      await ctx.reply(response.content);
    } catch (e) {
      console.log(e);
    }
  }

  @On('text')
  async textMessage(@Ctx() ctx: any): Promise<any> {
    ctx.session ??= INITIAL_SESSION;
    try {
      await ctx.reply(bold('Принято! 😊 Жду ответа от сервера. 🤖'));
      ctx.session.messages.push({
        role: OpenAIRoles.USER,
        content: ctx.message.text,
      });
      const response = await this.openai.chat(ctx.session.messages);
      ctx.session.messages.push({
        role: OpenAIRoles.ASSISTANT,
        content: response.content,
      });

      await ctx.reply(response.content);
    } catch (e) {
      console.log(e);
    }
  }
}
