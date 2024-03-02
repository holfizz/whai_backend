import { PrismaService } from "@/prisma.service";
import { Module } from "@nestjs/common";
import { ChatMembersResolver } from "./chat-members.resolver";
import { ChatMembersService } from "./chat-members.service";

@Module({
  providers: [ChatMembersResolver, ChatMembersService, PrismaService],
})
export class ChatMembersModule {}
