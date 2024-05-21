import { Test, TestingModule } from '@nestjs/testing';
import { QuizPlanResolver } from './quiz-plan.resolver';
import { QuizPlanService } from './quiz-plan.service';

describe('QuizPlanResolver', () => {
  let resolver: QuizPlanResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QuizPlanResolver, QuizPlanService],
    }).compile();

    resolver = module.get<QuizPlanResolver>(QuizPlanResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
