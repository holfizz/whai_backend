import { Module } from '@nestjs/common';
import { QuizPlanService } from './quiz-plan.service';
import { QuizPlanResolver } from './quiz-plan.resolver';

@Module({
  providers: [QuizPlanResolver, QuizPlanService],
})
export class QuizPlanModule {}
