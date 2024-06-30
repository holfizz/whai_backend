import { PrismaService } from "@/prisma.service";
import { Module } from "@nestjs/common";
import { TopicResolver } from "./topic.resolver";
import { TopicService } from "./topic.service";

@Module({
  providers: [TopicResolver, TopicService, PrismaService],
})
export class TopicModule {}
