import { PrismaService } from "@/prisma.service";
import { UserService } from "@/user/user.service";
import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { User } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { SignInInput, SignUpInput } from "./dto/auth.input";
import { MailService } from "./mail.service";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private userService: UserService,
    private mailService: MailService,
  ) {}
  private async issueTokens(userId: number) {
    const data = { id: userId };

    const accessToken = this.jwt.sign(data, {
      expiresIn: "1h",
    });

    const refreshToken = this.jwt.sign(data, {
      expiresIn: "7d",
    });
    return { accessToken, refreshToken };
  }

  private returnUserFields(user: Partial<User>): Partial<User> {
    return {
      id: user.id,
      email: user.email,
      isAdmin: user.isAdmin,
      isActivated: user.isActivated,
      activationLink: user.activationLink,
      phoneNumber: user.phoneNumber,
      avatarPath: user.avatarPath,
      firstName: user.firstName,
      lastName: user.lastName,
    };
  }

  async signUp(dto: SignUpInput) {
    const existUser = await this.prisma.user.findUnique({
      where: { email: dto.email, phoneNumber: dto.phoneNumber },
    });

    if (existUser) {
      throw new BadRequestException("Пользователь уже существует");
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

  async signIn(dto: SignInInput) {
    const user = await this.validateUser(dto);

    const tokens = await this.issueTokens(user.id);
    return {
      user: this.returnUserFields(user),
      ...tokens,
    };
  }

  async getNewTokens(refreshToken: string) {
    const result = await this.jwt.verifyAsync(refreshToken);
    if (!result) throw new UnauthorizedException("Invalid refresh token");
    const user = await this.prisma.user.findUnique({
      where: { id: result.id },
    });
    const tokens = await this.userService.byId(result.id);
    return {
      user: this.returnUserFields(user),
      ...tokens,
    };
  }

  private async validateUser(dto: SignInInput) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new BadRequestException("Пользователь не найден");
    }
    if (!user.isActivated) {
      throw new BadRequestException("Подтвердите почту");
    }
    const isValid = await bcrypt.compare(dto.password, user.password);

    if (!isValid) throw new UnauthorizedException("Неверный пароль");
    return user;
  }

  async isActivated(activationLink) {
    if (!activationLink.link) {
      return false;
    }
    const user = await this.prisma.user.findFirst({
      where: {
        activationLink: activationLink.link,
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
        isActivated: true,
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
    await this.mailService.sendActivationMail(email, `${process.env.FRONTEND_URL}/reset-password/${resetToken}`);
    return "Сообщение отправлено";
  }

  async forgotPassword(email) {
    await this.generateResetPasswordToken(email.email);
    return true;
  }

  async resetPassword(token: string, dto: SignInInput) {
    const user = await this.prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
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
}
