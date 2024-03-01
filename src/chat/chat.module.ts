import { PrismaService } from "@/prisma.service";
import { Module } from "@nestjs/common";
import { ChatResolver } from "./chat.resolver";
import { ChatService } from "./chat.service";

@Module({
  providers: [ChatService, PrismaService, ChatResolver],
})
export class ChatModule {}
