import { EduAiModule } from "@/edu-ai/edu-ai.module";
import { EduAiService } from "@/edu-ai/edu-ai.service";
import { PrismaService } from "@/prisma.service";
import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { PlanRepository } from "./plan.repository";
import { PlanResolver } from "./plan.resolver";
import { PlanService } from "./plan.service";
import { PlanUtils } from "./plan.utils";

@Module({
  providers: [PlanResolver, PlanService, PrismaService, PlanRepository, PlanUtils, EduAiService],
  imports: [EduAiModule, HttpModule],
})
export class PlanModule {}
