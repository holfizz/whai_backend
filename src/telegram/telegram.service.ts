import { Command, Ctx, On, Start, Update } from 'nestjs-telegraf';
import { Context, Markup, Telegraf } from 'telegraf';
import { ConfigService } from '@nestjs/config';
import { OggConverterService } from '@/ogg-converter/ogg-converter.service';
import { OpenAIRoles, OpenaiService } from '@/openai/openai.service';
import { bold } from 'telegraf/format';
import { SceneContext } from 'telegraf/typings/scenes';

type InitSessionType = { messages: any[] };

type MessageContext = Context & { session: InitSessionType } & SceneContext;

interface TelegramMessage {
  voice: {
    duration: number;
    mime_type: string;
    file_id: string;
    file_unique_id: string;
    file_size: number;
  };
}

const INITIAL_SESSION: InitSessionType = {
  messages: [],
};
const MAX_REQUESTS_UNSUBSCRIBED = 10;
const MAX_REQUESTS_SUBSCRIBED = 24;
const REQUESTS_CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

@Update()
export class TelegramService extends Telegraf<MessageContext> {
  private requestCounters: Map<
    number,
    { count: number; lastRequestTime: number }
  > = new Map();

  constructor(
    private readonly configService: ConfigService,
    private readonly ogg: OggConverterService,
    private readonly openai: OpenaiService,
  ) {
    super(configService.get('TELEGRAM_KEY'));
  }

  private async ensureSubscription(ctx: MessageContext): Promise<boolean> {
    const chatMember = await ctx.telegram.getChatMember(
      '@whai_channel',
      ctx.message.from.id,
    );

    const subscribed = chatMember.status;
    console.log(subscribed);
    if (!subscribed) {
      const keyboardMarkup = Markup.inlineKeyboard([
        Markup.button.url('Подпишись на наш канал', 't.me/whai_channel'),
      ]);
      await ctx.reply(
        'Пожалуйста, подпишитесь на наш канал для продолжения использования.',
        keyboardMarkup,
      );
      return false;
    }

    if (!this.requestCounters.has(ctx.from.id)) {
      this.requestCounters.set(ctx.from.id, { count: 0, lastRequestTime: 0 });
    }

    const { count, lastRequestTime } = this.requestCounters.get(ctx.from.id)!;
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    const maxRequests = subscribed
      ? MAX_REQUESTS_SUBSCRIBED
      : MAX_REQUESTS_UNSUBSCRIBED;
    if (timeSinceLastRequest < REQUESTS_CACHE_EXPIRY && count >= maxRequests) {
      if (subscribed) {
        await ctx.reply(
          `Вы исчерпали свой лимит запросов. Следущие ${MAX_REQUESTS_SUBSCRIBED} запросов будут доступны завтра.`,
        );
      } else {
        const keyboardMarkup = Markup.inlineKeyboard([
          Markup.button.url('Подпишись на наш канал', 't.me/whai_channel'),
        ]);
        await ctx.reply(
          `Вы исчерпали свой лимит запросов. Чтобы получить ${MAX_REQUESTS_SUBSCRIBED} запросов в день, подпишитесь на канал.`,
          keyboardMarkup,
        );
        return false;
      }
    }
    return true;
  }

  private updateRequestCounters(ctx: MessageContext): void {
    const { count } = this.requestCounters.get(ctx.from.id)!;
    this.requestCounters.set(ctx.from.id, {
      count: count + 1,
      lastRequestTime: Date.now(),
    });
  }

  private async sendMessage(ctx: MessageContext) {
    this.updateRequestCounters(ctx);
    ctx.session.messages = ctx.session.messages.slice(-4);
    await ctx.sendChatAction('typing');
    const response = await this.openai.chat(ctx.session.messages); // передаем контекст в GPT-3 чат
    ctx.session.messages.push({
      role: OpenAIRoles.ASSISTANT,
      content: response.content,
    });
    await ctx.replyWithMarkdown(response.content);
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
      if (!(await this.ensureSubscription(ctx))) {
        return;
      }
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
      await this.sendMessage(ctx);
    } catch (e) {
      console.log(e);
    }
  }

  @On('text')
  async textMessage(@Ctx() ctx: MessageContext): Promise<any> {
    ctx.session ??= INITIAL_SESSION;
    try {
      if (!(await this.ensureSubscription(ctx))) {
        return;
      }
      await ctx.reply(bold('Принято! 😊 Жду ответа от сервера. 🤖'));
      ctx.session.messages.push({
        role: OpenAIRoles.USER,
        content: (ctx.message as any).text,
      });
      await this.sendMessage(ctx);
    } catch (e) {
      console.log(e);
    }
  }
}
