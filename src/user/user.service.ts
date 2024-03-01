import { FileService, FileType } from "@/file-/file.service";
import { PrismaService } from "@/prisma.service";
import { Injectable } from "@nestjs/common";
import { UpdateUserInput } from "./dto/update-user.input";

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private readonly fileService: FileService,
  ) {}

  async byId(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  }

  async updateProfile(id: number, updateUserDto: UpdateUserInput, picture: any) {
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
        id: id,
      },
      data,
    });
  }
}
