import { Module } from "@nestjs/common";
import { CoursePlanResolver } from "./coursePlan.resolver";
import { CoursePlanService } from "./coursePlan.service";

@Module({
  providers: [CoursePlanResolver, CoursePlanService],
})
export class CoursePlanModule {}
