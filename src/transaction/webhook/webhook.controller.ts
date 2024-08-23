import { TinkoffNotificationDto } from "@/lib/tinkoff/types/tinkoff.types";
import { Body, Controller, HttpCode, Post } from "@nestjs/common";
import { WebhookService } from "./webhook.service";

@Controller("webhook")
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}
  @HttpCode(200)
  @Post()
  async handleWebhook(@Body() dto: TinkoffNotificationDto): Promise<any> {
    return this.webhookService.tinkoff(dto);
  }
}
