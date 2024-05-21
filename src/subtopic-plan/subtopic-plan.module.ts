import { Module } from '@nestjs/common';
import { SubtopicPlanService } from './subtopic-plan.service';
import { SubtopicPlanResolver } from './subtopic-plan.resolver';

@Module({
  providers: [SubtopicPlanResolver, SubtopicPlanService],
})
export class SubtopicPlanModule {}
