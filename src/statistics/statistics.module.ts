import { PrismaService } from "@/prisma.service";
import { Module } from "@nestjs/common";
import { StatisticsResolver } from "./statistics.resolver";
import { StatisticsService } from "./statistics.service";

@Module({
  providers: [StatisticsResolver, StatisticsService, PrismaService],
})
export class StatisticsModule {}
