import { Module } from '@nestjs/common';
import { LessonPlanService } from './lesson-plan.service';
import { LessonPlanResolver } from './lesson-plan.resolver';

@Module({
  providers: [LessonPlanResolver, LessonPlanService],
})
export class LessonPlanModule {}
