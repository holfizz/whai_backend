import { ConfigService } from "@nestjs/config";
import { FileUpload } from "graphql-upload-ts";
import { Update } from "nestjs-telegraf";
import { Context, Telegraf } from "telegraf";
import { SceneContext } from "telegraf/typings/scenes";

type MessageContext = Context & SceneContext;

@Update()
export class TelegramService extends Telegraf<MessageContext> {
  constructor(private readonly configService: ConfigService) {
    super(configService.get<string>("TELEGRAM_API_KEY"));
  }

  async sendFileAndGetMessageUrl(file: FileUpload, caption?: string): Promise<string> {
    try {
      const chatId = "-1002244125318";

      const { createReadStream, filename } = file;

      const fileStream = createReadStream();

      const result = await this.telegram.sendDocument(
        chatId,
        {
          source: fileStream,
          filename: filename,
        },
        {
          caption: caption || "",
        },
      );

      const fileId = result.document?.file_id;
      if (!fileId) {
        throw new Error("Failed to get file ID from Telegram response");
      }

      const fileInfo = await this.telegram.getFile(fileId);

      const fileUrl = `https://api.telegram.org/file/bot${this.configService.get<string>("TELEGRAM_API_KEY")}/${fileInfo.file_path}`;

      return fileUrl;
    } catch (error) {
      console.error("Failed to send file or get public URL", error);
      throw new Error("Failed to send file or get public URL");
    }
  }
}
