import { PrismaService } from "@/prisma.service";
import { Injectable, NotFoundException } from "@nestjs/common";
import { FolderInput } from "./dto/create-folder.input";
import { UpdateFolderInput } from "./dto/update-folder.input";

@Injectable()
export class FolderService {
  constructor(private readonly prisma: PrismaService) {}

  async createFolder(createFolderInput: FolderInput) {
    return this.prisma.folder.create({
      data: {
        ...createFolderInput,
      },
    });
  }

  async updateFolder(id: string, updateFolderInput: UpdateFolderInput) {
    let existingFolder = await this.prisma.folder.findUnique({ where: { id } });

    if (!existingFolder) {
      throw new NotFoundException(`Folder with ID ${id} not found.`);
    }

    return this.prisma.folder.update({
      where: { id },
      data: {
        ...updateFolderInput,
      },
    });
  }

  async deleteFolder(id: string) {
    let existingFolder = await this.prisma.folder.findUnique({ where: { id } });

    if (!existingFolder) {
      throw new NotFoundException(`Folder with ID ${id} not found.`);
    }

    return this.prisma.folder.delete({ where: { id } });
  }
}
