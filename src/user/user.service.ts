import { FileService, FileType } from '@/file/file.service';
import { PrismaService } from '@/prisma.service';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { UpdateUserDto } from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private readonly fileService: FileService,
  ) {}

  async byId(id: number, selectObject?: Prisma.UserSelect) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        createdAt: true,
        email: true,
        firstName: true,
        phoneNumber: true,
        lastName: true,
      },
    });
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  async updateProfile(
    id: number,
    updateUserDto: UpdateUserDto,
    picture: string,
  ) {
    let avatarPath: string | undefined = undefined;

    if (picture) {
      avatarPath = this.fileService.createFile(FileType.IMAGE, picture);
    }

    const data = {
      ...updateUserDto,
      ...(avatarPath && { avatarPath }),
    };

    return this.prisma.user.update({
      where: {
        id,
      },
      data,
    });
  }
}
