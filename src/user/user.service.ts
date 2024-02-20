import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma } from '@prisma/client';

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

  //TODO:нужно сделать update
  // async updateProfile(id: number, dto: UserDto) {
  //   return this.prisma.user.update({
  //     where: {
  //       id,
  //     },
  //     data: {
  //       email: dto.email,
  //       password: dto.password ?? (await bcrypt.hash(dto.password, 5)),
  //       phoneNumber: dto.phoneNumber,
  //       avatarPath: dto.avatarPath,
  //       firstName: dto.firstName,
  //       lastName: dto.lastName,
  //       userMode: dto.userMode,
  //     },
  //   });
  // }
}
