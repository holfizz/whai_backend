import { PrismaService } from "@/prisma.service";
import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { User } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { randomUUID } from "crypto";
import { Response } from "express";
import { ActivationLinkInput, loginInput, ResetPasswordInput, SignUpInput } from "./dto/auth.input";
import { MailService } from "./mail.service";

@Injectable()
export class AuthService {
  REFRESH_TOKEN_NAME = "refreshToken";
  EXPIRE_DAY_REFRESH_TOKEN = 1;
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private mailService: MailService,
  ) {}

  private async issueTokens(userId: string) {
    try {
      const data = { id: userId };

      const accessToken = this.jwt.sign(data, {
        expiresIn: "1d",
      });

      const refreshToken = this.jwt.sign(data, {
        expiresIn: "7d",
      }) as string;

      return { accessToken, refreshToken };
    } catch (error) {
      throw error;
    }
  }

  private returnUserFields(user: Partial<User>): Partial<User> {
    return {
      id: user.id,
      email: user.email,
      roles: user.roles,
      isVerified: user.isVerified,
      activationLink: user.activationLink,
      phoneNumber: user.phoneNumber,
      avatarPath: user.avatarPath,
      firstName: user.firstName,
      lastName: user.lastName,
    };
  }

  async signUp(dto: SignUpInput) {
    try {
      const existUserByEmail = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });
      if (existUserByEmail) {
        throw new BadRequestException("Пользователь с таким email уже существует");
      }

      const existUserByPhoneNumber = await this.prisma.user.findUnique({
        where: { phoneNumber: dto.phoneNumber },
      });

      if (existUserByPhoneNumber) {
        throw new BadRequestException("Пользователь с таким номером телефона уже существует");
      }

      const activationLink = crypto.randomUUID();
      console.log(activationLink);
      await this.mailService.sendActivationMail(dto.email, `${process.env.FRONTEND_URL}/confirmEmail/${activationLink}`);

      const user = await this.prisma.user.create({
        data: {
          firstName: dto.firstName,
          lastName: dto.lastName,
          phoneNumber: dto.phoneNumber,
          email: dto.email,
          password: await bcrypt.hash(dto.password, 5),
          activationLink: activationLink,
          isVerified: true,
        },
      });

      const tokens = await this.issueTokens(user.id);

      return {
        user: this.returnUserFields(user),
        ...tokens,
      };
    } catch (error) {
      throw error;
    }
  }

  async login(dto: loginInput) {
    try {
      const { password, ...user } = await this.validateUser(dto);
      const tokens = await this.issueTokens(user.id);

      return {
        user,
        ...tokens,
      };
    } catch (error) {
      throw error;
    }
  }
  async getNewTokens(refreshToken: string) {
    try {
      const result = await this.jwt.verifyAsync(refreshToken);
      if (!result) {
        throw new UnauthorizedException("Invalid refresh token");
      }
      const { password, ...user } = await this.prisma.user.findUnique({
        where: { id: result.id },
      });
      const tokens = await this.issueTokens(user.id);
      return {
        user,
        ...tokens,
      };
    } catch (error) {
      throw error;
    }
  }

  private async validateUser(dto: loginInput) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });

      if (!user) {
        throw new BadRequestException("Пользователь не найден");
      }
      if (!user.isVerified) {
        throw new BadRequestException("Подтвердите почту");
      }
      const isValid = await bcrypt.compare(dto.password, user.password);

      if (!isValid) throw new UnauthorizedException("Неверный пароль");
      return user;
    } catch (error) {
      throw error;
    }
  }

  async isActivated(dto: ActivationLinkInput) {
    try {
      if (!dto.activationLink) {
        return false;
      }
      const user = await this.prisma.user.findUnique({
        where: {
          activationLink: dto.activationLink,
        },
      });
      if (!user) {
        throw new Error("Пользователь не найден");
      }

      await this.prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          isVerified: true,
          activationLink: null,
        },
      });

      return true;
    } catch (error) {
      throw error;
    }
  }

  async generateResetPasswordToken(email: string) {
    try {
      const user = await this.prisma.user.findFirst({
        where: { email },
      });

      if (!user) {
        throw new BadRequestException("Пользователь не найден");
      }

      const resetToken = crypto.randomUUID();
      const expirationDate = new Date();
      expirationDate.setHours(expirationDate.getHours() + 1);
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          resetPasswordToken: resetToken,
          resetPasswordExpiration: expirationDate,
        },
      });
      await this.mailService.sendActivationMail(user.email, `${process.env.FRONTEND_URL}/reset-password/${resetToken}`);
      return "Сообщение отправлено";
    } catch (error) {
      throw error;
    }
  }

  async forgotPassword(email) {
    try {
      await this.generateResetPasswordToken(email.email);
      return true;
    } catch (error) {
      throw error;
    }
  }

  async resetPassword(dto: ResetPasswordInput) {
    try {
      const user = await this.prisma.user.findFirst({
        where: {
          resetPasswordToken: dto.token,
          resetPasswordExpiration: {
            gte: new Date(),
          },
        },
      });

      if (!user) {
        throw new BadRequestException("Ссылка неверная или срок действия ссылки истек");
      }

      await this.prisma.user.update({
        where: { id: user.id },
        data: { password: await bcrypt.hash(dto.password, 5) },
      });

      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          resetPasswordToken: null,
          resetPasswordExpiration: null,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  addRefreshTokenToResponse(res: Response, refreshToken: string) {
    try {
      const expiresIn = new Date();
      expiresIn.setDate(expiresIn.getDate() + this.EXPIRE_DAY_REFRESH_TOKEN);
      res.cookie(this.REFRESH_TOKEN_NAME, refreshToken, {
        httpOnly: true,
        expires: expiresIn,
        secure: true,
        domain: process.env.NODE_ENV === "development" ? "localhost" : process.env.DOMAIN,
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      });
    } catch (error) {
      throw error;
    }
  }

  removeRefreshTokenFromResponse(res: Response) {
    try {
      const expiresIn = new Date();
      expiresIn.setDate(expiresIn.getDate() + this.EXPIRE_DAY_REFRESH_TOKEN);
      res.cookie(this.REFRESH_TOKEN_NAME, "", {
        httpOnly: true,
        domain: process.env.DOMAIN,
        expires: new Date(0),
        secure: true,
        //PRODUCTION - нужно поставить lax
        sameSite: process.env.NODE_ENV === "development" ? "none" : "lax",
      });
    } catch (error) {
      throw error;
    }
  }

  async generateTelegramLink(userId: string): Promise<{ link: string; message: string }> {
    let token;
    let message = "Ссылка для подключения вашего Telegram аккаунта была сгенерирована.";

    const existingLink = await this.prisma.telegramLink.findUnique({
      where: { userId },
    });

    if (existingLink) {
      token = existingLink.token; // Используем существующий токен
      message = "Ссылка для подключения Telegram уже была отправлена. Пожалуйста, проверьте ваш Telegram.";
    } else {
      token = randomUUID();
      await this.prisma.telegramLink.create({
        data: {
          userId: userId,
          token: token,
          createdAt: new Date(),
        },
      });
    }

    const link = `${process.env.TELEGRAM_BOT_URL}/?start=${token}`;

    return {
      link,
      message,
    };
  }

  async handleTelegramAuth(token: string, telegramId: string): Promise<{ message: string; userEmail?: string }> {
    const telegramLink = await this.prisma.telegramLink.findUnique({
      where: { token },
    });

    if (!telegramLink) {
      throw new BadRequestException("Неверный или устаревший токен.");
    }

    const user = await this.prisma.user.update({
      where: { id: telegramLink.userId },
      data: { isTelegramLinked: true, telegramId },
      select: { email: true },
    });

    return {
      message: "Ваш аккаунт успешно подключен к Telegram!",
      userEmail: user.email,
    };
  }
}
