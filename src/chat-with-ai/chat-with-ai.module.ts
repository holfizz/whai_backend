import { FileService } from "@/file/file.service";
import { PaginationModule } from "@/pagination/pagination.module";
import { PrismaService } from "@/prisma.service";
import { Module } from "@nestjs/common";
import { ChatWithAIResolver } from "./chat-with-ai.resolver";
import ChatWithAIService from "./chat-with-ai.service";

@Module({
  providers: [ChatWithAIService, PrismaService, FileService, ChatWithAIResolver],
  imports: [PaginationModule],
})
export class ChatWIthAIModule {}
