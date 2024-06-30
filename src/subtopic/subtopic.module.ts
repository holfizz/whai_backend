import { PrismaService } from "@/prisma.service";
import { Module } from "@nestjs/common";
import { SubtopicResolver } from "./subtopic.resolver";
import { SubtopicService } from "./subtopic.service";

@Module({
  providers: [SubtopicResolver, SubtopicService, PrismaService],
})
export class SubtopicModule {}
