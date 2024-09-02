import { ConfigService } from "@nestjs/config";
import { TelegrafModuleAsyncOptions, TelegrafModuleOptions } from "nestjs-telegraf";

const telegrafModuleOptions = (config: ConfigService): TelegrafModuleOptions => {
  const token = config.get("TELEGRAM_API_KEY");
  if (!token) {
    throw new Error("Telegram bot token is not defined in the configuration");
  }
  return {
    token,
  };
};

export const options = (): TelegrafModuleAsyncOptions => {
  return {
    imports: [],
    inject: [ConfigService],
    useFactory: (config: ConfigService) => {
      return telegrafModuleOptions(config);
    },
  };
};
