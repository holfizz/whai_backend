import { Test, TestingModule } from '@nestjs/testing';
import { QuizPlanService } from './quiz-plan.service';

describe('QuizPlanService', () => {
  let service: QuizPlanService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QuizPlanService],
    }).compile();

    service = module.get<QuizPlanService>(QuizPlanService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
