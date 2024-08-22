import { INotificationBase } from "@/lib/tinkoff/types/tinkoff.types";
import { Body, Controller, Post } from "@nestjs/common";
import { WebhookService } from "./webhook.service";

@Controller("webhook")
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post()
  async handleWebhook(@Body() dto: INotificationBase): Promise<boolean> {
    return this.webhookService.tinkoff(dto);
  }
}
