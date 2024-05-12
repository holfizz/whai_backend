import { AuthTemplate } from "@/templates/auth.template";
import { MailerService } from "@nestjs-modules/mailer";
import { Injectable } from "@nestjs/common";
import { render } from "@react-email/components";

const emailHTML = (link: string) => {
  return render(AuthTemplate({ link }));
};

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendActivationMail(to, link) {
    await this.mailerService.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject: "Активация аккаунта на " + process.env.API_URL,
      text: "",
      html: emailHTML(link),
    });
  }
}
