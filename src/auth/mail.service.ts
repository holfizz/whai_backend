import { ConfirmRegistrationTemplate } from "@/templates/auth.template";
import { ResetPasswordTemplate } from "@/templates/reset-password.template";
import { MailerService } from "@nestjs-modules/mailer";
import { Injectable } from "@nestjs/common";
import { render } from "@react-email/components";

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  // Функция для выбора и отрисовки HTML-шаблона в зависимости от типа письма
  private emailHTML(type: "ACTIVATE_EMAIL" | "RESET_PASS", link: string, email: string, name: string) {
    switch (type) {
      case "ACTIVATE_EMAIL":
        return render(ConfirmRegistrationTemplate({ link, email, name }));
      case "RESET_PASS":
        return render(ResetPasswordTemplate({ link, email }));
      default:
        throw new Error(`Unsupported email type: ${type}`);
    }
  }

  async sendActivationMail({ to, link, name, type }: { to: string; link: string; name: string; type: "ACTIVATE_EMAIL" | "RESET_PASS" }) {
    await this.mailerService.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject: type === "ACTIVATE_EMAIL" ? "Подтвердите регистрацию на платформе Whai" : "Сброс пароля на платформе Whai",
      text: "",
      html: this.emailHTML(type, link, to, name),
    });
  }
}
