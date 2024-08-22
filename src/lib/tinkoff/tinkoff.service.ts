import logger from "@/helpers/logger";
import { PrismaService } from "@/prisma.service";
import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as crypto from "crypto";
import { TinkoffPaymentDto, TinkoffRequestDto } from "./dto/tinkoff.dto";
import { IInitPaymentResponse } from "./types/tinkoff.types";

@Injectable()
export class TinkoffService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async createPayment(paymentData: TinkoffPaymentDto, userId: string) {
    logger.log("Creating payment for user:", userId);
    const subs = await this.prisma.subscription.findUnique({ where: { type: paymentData.subType } });

    if (!subs) {
      logger.error(`Subscription with type ${paymentData.subType} does not exist`);
      throw new Error(`Subscriptions with this type - ${paymentData.subType} do not exist`);
    }

    logger.log("Found subscription:", subs);
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const transaction = await this.prisma.transaction.create({
      data: {
        user: {
          connect: { id: userId },
        },
        type: "BASIC",
        amount: subs.price,
      },
    });

    logger.log("Created transaction:", transaction);

    const payload: TinkoffRequestDto = {
      Amount: transaction.amount * 100,
      OrderId: transaction.id,
      Descriptions: `Покупка подписки на платформе https://whai.ru`,
      userId,
      subs: subs,
    };

    logger.log("Payload for Tinkoff request:", payload);

    return await this.request<IInitPaymentResponse>(payload, "Init");
  }

  private async request<T>(dto: TinkoffRequestDto, endpoint: string): Promise<T> {
    try {
      logger.log("Generating token for request...");
      const Token = this.generateToken({
        TerminalKey: this.configService.get<string>("TBANK_TERMINAL"),
        Amount: dto.Amount,
        OrderId: dto.OrderId,
        Description: dto.Descriptions,
        CustomerKey: dto.userId,
      });

      logger.log("Generated Token:", Token);

      const user = await this.prisma.user.findUnique({ where: { id: dto.userId } });

      if (!user) {
        logger.error(`User with id ${dto.userId} not found`);
        throw new Error(`User with id ${dto.userId} not found`);
      }

      logger.log("User details:", user);

      const { data } = await this.httpService.axiosRef.request({
        method: "POST",
        url: `${this.configService.get<string>("TINKOFF_API_URL")}/${endpoint}`,
        data: {
          TerminalKey: this.configService.get<string>("TBANK_TERMINAL"),
          Amount: dto.Amount,
          OrderId: dto.OrderId,
          Description: dto.Descriptions,
          Token,
          CustomerKey: dto.userId,
          Recurrent: "Y",
          DATA: {
            Phone: user.phoneNumber,
            Email: user.email,
          },
          Receipt: {
            Email: user.email,
            Phone: user.phoneNumber,
            Taxation: "usn_income",
            Items: [
              {
                Name:
                  dto.subs.type === "BASIC"
                    ? "Базовая подписка"
                    : dto.subs.type === "STANDARD"
                      ? "Стандартная подписка"
                      : dto.subs.type === "PREMIUM"
                        ? "Премиум подписка"
                        : "Подписка",
                Price: dto.subs.price * 100,
                Quantity: 1,
                Amount: dto.subs.price * 100,
                Tax: "none",
              },
            ],
          },
        },
        headers: {
          "Content-Type": "application/json",
        },
      });

      logger.log("Response from Tinkoff:", data);

      return data;
    } catch (error) {
      logger.error("Error during request:", error);
      throw error;
    }
  }

  private generateToken(params: Record<string, any>): string {
    logger.log("Generating SHA-256 token with params:", params);

    const password = this.configService.get<string>("TINKOFF_PASSWORD");
    params["Password"] = password;

    const sortedParams = Object.keys(params)
      .sort()
      .map(key => params[key])
      .join("");

    const token = crypto.createHash("sha256").update(sortedParams).digest("hex");

    logger.log("Generated token:", token);

    return token;
  }
}
