import { Ctx, Message, On, Start, Update } from 'nestjs-telegraf';
import { Scenes, Telegraf } from 'telegraf';

type Context = Scenes.SceneContext;

@Update()
export class TelegramService extends Telegraf<Context> {
  @Start()
  async onStart(@Ctx() ctx: Context) {
    await ctx.replyWithHTML(`<b>Привет,  @${ctx.from.username}!</b>

Добро пожаловать в мир языкового обучения с помощью нашего бота на основе ChatGPT.
Здесь ты можешь общаться с нашим умным помощником, который будет помогать тебе <b>улучшить знание языков.</b>
Не стесняйся задавать вопросы и учиться новому каждый день! 🌟
`);
  }
  @On('text')
  async onMessage(@Message('text') message: string, @Ctx() ctx: Context) {
    `${message}`;
  }
}
