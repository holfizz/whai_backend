import { NotificationTemplate } from "@/templates/sub-notification.template";
import { TrialNotificationTemplate } from "@/templates/trial-notification.template";
import { MailerService } from "@nestjs-modules/mailer";
import { Injectable } from "@nestjs/common";
import { render } from "@react-email/render";

@Injectable()
export class SubscriptionNotificationService {
  constructor(private readonly mailerService: MailerService) {}

  private emailHTML(params: { name: string; subscriptionType: string; endDate: string }) {
    return render(NotificationTemplate(params));
  }

  async sendExpirationReminder({ to, name, subscriptionType, endDate }: { to: string; name: string; subscriptionType: string; endDate: string }) {
    await this.mailerService.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject: `Ваша подписка заканчивается ${endDate} | Whai`,
      text: "",
      html: this.emailHTML({
        name,
        subscriptionType,
        endDate,
      }),
    });
  }
  private emailTrialHTML(params: { name: string; endDate: string; isTrialEndingSoon: boolean }) {
    return render(
      TrialNotificationTemplate({
        name: params.name,
        endDate: params.endDate,
        type: params.isTrialEndingSoon ? "reminder" : "notification",
      }),
    );
  }

  async sendTrialExpirationReminder({ to, name, endDate, isTrialEndingSoon }: { to: string; name: string; endDate: string; isTrialEndingSoon: boolean }) {
    const subject = isTrialEndingSoon ? "Ваша пробная подписка заканчивается через 1 день" : "Ваша пробная подписка истекла";

    await this.mailerService.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject,
      html: this.emailTrialHTML({
        name,
        endDate,
        isTrialEndingSoon,
      }),
    });
  }
}
