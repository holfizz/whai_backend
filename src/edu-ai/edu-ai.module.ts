import { PaginationModule } from "@/pagination/pagination.module";
import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { EduAiService } from "./edu-ai.service";
import { PrismaService } from "@/prisma.service";

@Module({
  providers: [EduAiService, PrismaService],
  imports: [PaginationModule, HttpModule],
})
export class EduAiModule {}
