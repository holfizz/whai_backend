import { FileService } from "@/file/file.service";
import { PaginationModule } from "@/pagination/pagination.module";
import { PrismaService } from "@/prisma.service";
import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { ChatWithAIResolver } from "./chat-with-ai.resolver";
import ChatWithAIService from "./chat-with-ai.service";

@Module({
  providers: [ChatWithAIService, PrismaService, FileService, ChatWithAIResolver],
  imports: [PaginationModule, HttpModule],
})
export class ChatWIthAIModule {}
