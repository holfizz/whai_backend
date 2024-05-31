import { PaginationModule } from "@/pagination/pagination.module";
import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { EduAiService } from "./edu-ai.service";

@Module({
  providers: [EduAiService],
  imports: [PaginationModule, HttpModule],
})
export class EduAiModule {}
