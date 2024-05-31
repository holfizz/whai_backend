import { EduAiModule } from "@/edu-ai/edu-ai.module";
import { EduAiService } from "@/edu-ai/edu-ai.service";
import { FileService } from "@/file/file.service";
import { PaginationModule } from "@/pagination/pagination.module";
import { PrismaService } from "@/prisma.service";
import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { MessageWithAiResolver } from "./message-with-ai.resolver";
import { MessageWithAiService } from "./message-with-ai.service";

@Module({
  providers: [MessageWithAiResolver, MessageWithAiService, PrismaService, FileService, EduAiService],
  imports: [PaginationModule, HttpModule, EduAiModule],
})
export class MessageWithAiModule {}
