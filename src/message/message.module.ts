import { PrismaService } from "@/prisma.service";
import { Module } from "@nestjs/common";
import { MessageResolver } from "./message.resolver";
import { MessageService } from "./message.service";

@Module({
  providers: [MessageResolver, MessageService, PrismaService],
})
export class MessageModule {}
