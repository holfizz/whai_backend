import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AuthDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { UserService } from '../user/user.service';
import { MailService } from './mail.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private userService: UserService,
    private mailService: MailService,
  ) {}

  async register(dto: AuthDto) {
    const existUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existUser) {
      throw new BadRequestException('User already exist');
    }
    const activationLink = crypto.randomUUID(); // v34fa-asfasf-142saf-sa-asf

    await this.mailService.sendActivationMail(
      dto.email,
      `${process.env.API_URL}/api/auth/activate/${activationLink}`,
    );
    const user = await this.prisma.user.create({
      data: {
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

  private async issueTokens(userId: number) {
    const data = { id: userId };

    const accessToken = this.jwt.sign(data, {
      expiresIn: '1h',
    });

    const refreshToken = this.jwt.sign(data, {
      expiresIn: '7d',
    });
    return { accessToken, refreshToken };
  }

  private returnUserFields(user: Partial<User>) {
    return {
      id: user.id,
      email: user.email,
      isAdmin: user.isAdmin,
      isActivated: user.isActivated,
      activationLink: user.activationLink,
    };
  }

  async login(dto: AuthDto) {
    const user = await this.validateUser(dto);

    const tokens = await this.issueTokens(user.id);
    return {
      user: this.returnUserFields(user),
      ...tokens,
    };
  }

  async getNewTokens(refreshToken: string) {
    const result = await this.jwt.verifyAsync(refreshToken);
    if (!result) throw new UnauthorizedException('Invalid refresh token');

    const user = await this.prisma.user.findUnique({
      where: { id: result.id },
    });
    const tokens = await this.userService.byId(result.id, {
      isAdmin: true,
    });
    return {
      user: this.returnUserFields(user),
      ...tokens,
    };
  }

  private async validateUser(dto: AuthDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }
    if(!user.isActivated){
      throw new BadRequestException('Confirm your email');
    }
    const isValid = await bcrypt.compare(dto.password, user.password);

    if (!isValid) throw new UnauthorizedException('Invalid password');
    return user;
  }

  async isActivated(activationLink: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        activationLink: activationLink,
      },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    return this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        isActivated: true,
      },
    });
  }
}
