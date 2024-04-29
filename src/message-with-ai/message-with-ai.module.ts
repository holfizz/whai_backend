import { FileService } from "@/file/file.service";
import { PaginationModule } from "@/pagination/pagination.module";
import { PrismaService } from "@/prisma.service";
import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { MessageWithAiResolver } from "./message-with-ai.resolver";
import { MessageWithAiService } from "./message-with-ai.service";

@Module({
  providers: [MessageWithAiResolver, MessageWithAiService, PrismaService, FileService],
  imports: [PaginationModule, HttpModule],
})
export class MessageWithAiModule {}
