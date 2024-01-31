import { BadRequestException, Injectable } from '@nestjs/common';
import { UserDto } from './user.dto';
import { PrismaService } from '../prisma.service';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async byId(id: number, selectObject?: Prisma.UserSelect) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  async updateProfile(id: number, dto: UserDto) {
    const isSameUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (isSameUser && id !== isSameUser.id) {
      throw new BadRequestException('Email already in use');
    }

    return this.prisma.user.update({
      where: {
        id,
      },
      data: {
        email: dto.email,
        password: dto.password ?? (await bcrypt.hash(dto.password, 5)),
      },
    });
  }
}
