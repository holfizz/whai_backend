import { InvoiceTemplate } from "@/templates/invoice.template";
import { MailerService } from "@nestjs-modules/mailer";
import { Injectable } from "@nestjs/common";
import { render } from "@react-email/render";

@Injectable()
export class TransactionMailService {
  constructor(private readonly mailerService: MailerService) {}

  private emailHTML(params: { amount: string; months: number; subscriptionType: string; date: string; name: string; autoRenew: boolean }) {
    return render(InvoiceTemplate(params));
  }

  async sendInvoiceMail({
    to,
    amount,
    months,
    subscriptionType,
    date,
    name,
    autoRenew,
  }: {
    to: string;
    amount: string;
    months: number;
    subscriptionType: string;
    date: string;
    name: string;
    autoRenew: boolean;
  }) {
    await this.mailerService.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject: `Ваш чек от ${date} | Whai`,
      text: "",
      html: this.emailHTML({
        amount,
        months,
        subscriptionType,
        date,
        name,
        autoRenew,
      }),
    });
  }
}
