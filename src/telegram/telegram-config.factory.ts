import {
  TelegrafModuleAsyncOptions,
  TelegrafModuleOptions,
} from 'nestjs-telegraf';
import { ConfigService } from '@nestjs/config';
import * as LocalSession from 'telegraf-session-local';

const sessions = new LocalSession();

const telegrafModuleOptions = (
  config: ConfigService,
): TelegrafModuleOptions => {
  return {
    middlewares: [sessions.middleware()],
    token: config.get('TELEGRAM_KEY'),
  };
};

export const options = (): TelegrafModuleAsyncOptions => {
  return {
    imports: undefined,
    inject: [ConfigService],
    useFactory: (config: ConfigService) => {
      return telegrafModuleOptions(config);
    },
  };
};
