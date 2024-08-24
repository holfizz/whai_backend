import logger from "@/helpers/logger";
import { PrismaService } from "@/prisma.service";
import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { SubscriptionType } from "@prisma/client";
import * as crypto from "crypto";
import { TinkoffPaymentDto, TinkoffRequestDto } from "./dto/tinkoff.dto";
import { TinkoffChargeResponse, TinkoffReqResult } from "./types/tinkoff.types";

@Injectable()
export class TinkoffService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async createPayment(paymentData: TinkoffPaymentDto, userId: string): Promise<TinkoffReqResult> {
    logger.log("Creating payment for user:", userId);
    const subs = await this.prisma.subscription.findUnique({ where: { type: paymentData.subType } });

    if (!subs) {
      logger.error(`Subscription with type ${paymentData.subType} does not exist`);
      throw new Error(`Subscriptions with this type - ${paymentData.subType} do not exist`);
    }

    logger.log("Found subscription:", subs);
    const transaction = await this.prisma.transaction.create({
      data: {
        user: {
          connect: { id: userId },
        },
        type: subs.type,
        months: paymentData.months,
        amount: paymentData.totalAmount,
      },
    });

    logger.log("Created transaction:", transaction);
    const getSubscriptionDescription = (type: SubscriptionType) => {
      switch (type) {
        case "BASIC":
          return "Базовая подписка предоставляет доступ к основным функциям платформы. Идеально подходит для пользователей, которым нужен стандартный набор инструментов и услуг.";
        case "STANDARD":
          return "Стандартная подписка включает все функции базового уровня плюс дополнительные возможности и расширенные опции для более глубокого использования платформы.";
        case "PREMIUM":
          return "Премиум подписка предлагает полный доступ ко всем функциям платформы, включая эксклюзивные возможности и первоклассный сервис для пользователей, ищущих максимальные возможности.";
        default:
          return "Подписка на платформе whai.ru";
      }
    };
    const payload: TinkoffRequestDto = {
      Amount: transaction.amount * 100,
      OrderId: transaction.id,
      Descriptions: getSubscriptionDescription(subs.type),
      userId,
      subs: subs,
    };

    logger.log("Payload for Tinkoff request:", payload);
    const tBankData = await this.request(payload, "Init");
    await this.prisma.transaction.update({ where: { id: transaction.id }, data: { orderId: tBankData.OrderId } });
    return tBankData;
  }

  private async request(dto: any, endpoint: string): Promise<TinkoffReqResult> {
    try {
      const user = await this.prisma.user.findUnique({ where: { id: dto.userId } });
      logger.log("Generating token for request...");
      const Token = this.generateToken({
        TerminalKey: this.configService.get<string>("TBANK_TERMINAL"),
        Amount: dto.Amount,
        OrderId: dto.OrderId,
        Description: dto.Descriptions,
        Recurrent: "Y",
        CustomerKey: user.id,
      });

      logger.log("Generated Token:", Token);

      const tinkoffTypePhoneNumber = (phone: string) => {
        const numOnly = phone.replace(/\D/g, "");
        return `+${numOnly}`;
      };
      if (!user) {
        logger.error(`User with id ${dto.userId} not found`);
        throw new Error(`User with id ${dto.userId} not found`);
      }

      logger.log("User details:", user);
      const reqData = {
        TerminalKey: this.configService.get<string>("TBANK_TERMINAL"),
        Amount: dto.Amount,
        OrderId: dto.OrderId,
        Description: dto.Descriptions,
        Token,
        CustomerKey: dto.userId,
        Recurrent: "Y",
        DATA: {
          Phone: tinkoffTypePhoneNumber(user.phoneNumber),
          Email: user.email,
        },
        Receipt: {
          Email: user.email,
          Phone: tinkoffTypePhoneNumber(user.phoneNumber),
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
              Price: dto.Amount,
              Quantity: 1,
              Amount: dto.Amount,
              Tax: "none",
            },
          ],
        },
      };
      logger.log("reqData", reqData);
      logger.log("reqDataReceipt", reqData.Receipt);
      const { data } = await this.httpService.axiosRef.request({
        method: "POST",
        url: `${this.configService.get<string>("TINKOFF_API_URL")}/${endpoint}`,
        data: reqData,
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
  async requestCharge(dto: any, endpoint: string): Promise<TinkoffChargeResponse> {
    try {
      const { data } = await this.httpService.axiosRef.request({
        method: "POST",
        url: `${this.configService.get<string>("TINKOFF_API_URL")}/${endpoint}`,
        data: dto,
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
  generateToken(params: Record<string, any>): string {
    console.log("Generating SHA-256 token with params:", params);

    const password = this.configService.get<string>("TBANK_PASSWORD");
    params["Password"] = password;
    const filteredParams = Object.keys(params)
      .filter(key => typeof params[key] !== "object")
      .map(key => ({ key, value: params[key] }));
    const sortedParams = filteredParams.sort((a, b) => a.key.localeCompare(b.key));
    const concatenatedValues = sortedParams.map(param => param.value).join("");
    const token = crypto.createHash("sha256").update(concatenatedValues, "utf8").digest("hex");
    console.log("Generated token:", token);
    return token;
  }
}
