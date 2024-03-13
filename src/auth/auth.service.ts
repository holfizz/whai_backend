import { PrismaService } from "@/prisma.service";
import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { User } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { Response } from "express";
import { ActivationLinkInput, ResetPasswordInput, SignUpInput, loginInput } from "./dto/auth.input";
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
  private issueTokens(userId: number) {
    const data = { id: userId };

    const accessToken = this.jwt.sign(data, {
      expiresIn: "10s",
    });

    const refreshToken = this.jwt.sign(data, {
      expiresIn: "7d",
    }) as string;

    return { accessToken, refreshToken };
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

    await this.mailService.sendActivationMail(dto.email, `${process.env.FRONTEND_URL}/confirmEmail/${activationLink}`);
    const user = await this.prisma.user.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        phoneNumber: dto.phoneNumber,
        email: dto.email,
        password: await bcrypt.hash(dto.password, 5),
        activationLink: activationLink,
      },
    });
    const tokens = await this.issueTokens(user.id);
    return {
      user: this.returnUserFields(user),
      ...tokens,
    };
  }

  async login(dto: loginInput) {
    const { password, ...user } = await this.validateUser(dto);
    const tokens = this.issueTokens(user.id);

    return {
      user,
      ...tokens,
    };
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
      const tokens = this.issueTokens(user.id);
      return {
        user,
        ...tokens,
      };
    } catch (error) {
      // Handle error appropriately
      throw new UnauthorizedException("Error verifying refresh token");
    }
  }

  private async validateUser(dto: loginInput) {
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
  }

  async isActivated(dto: ActivationLinkInput) {
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
  }

  async generateResetPasswordToken(email: string) {
    const user = await this.prisma.user.findFirst({
      where: { email },
    });

    if (!user) {
      throw new BadRequestException("Пользователь не найден");
    }

    const resetToken = crypto.randomUUID();
    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() + 1); // Токен будет действителен в течение 1 часа

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpiration: expirationDate,
      },
    });
    await this.mailService.sendActivationMail(user.email, `${process.env.FRONTEND_URL}/reset-password/${resetToken}`);
    return "Сообщение отправлено";
  }

  async forgotPassword(email) {
    await this.generateResetPasswordToken(email.email);
    return true;
  }

  async resetPassword(dto: ResetPasswordInput) {
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
  }
  addRefreshTokenToResponse(res: Response, refreshToken: string) {
    const expiresIn = new Date();
    expiresIn.setDate(expiresIn.getDate() + this.EXPIRE_DAY_REFRESH_TOKEN);
    res.cookie(this.REFRESH_TOKEN_NAME, refreshToken, {
      httpOnly: true,
      domain: process.env.DOMAIN,
      expires: expiresIn,
      secure: true,
      //PRODUCTION - нужно поставить lax
      sameSite: "none",
    });
  }
  removeRefreshTokenFromResponse(res: Response) {
    const expiresIn = new Date();
    expiresIn.setDate(expiresIn.getDate() + this.EXPIRE_DAY_REFRESH_TOKEN);
    res.cookie(this.REFRESH_TOKEN_NAME, "", {
      httpOnly: true,
      domain: process.env.DOMAIN,
      expires: new Date(0),
      secure: true,
      //PRODUCTION - нужно поставить lax
      sameSite: "none",
    });
  }
}
