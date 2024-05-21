import { Test, TestingModule } from '@nestjs/testing';
import { SubtopicPlanService } from './subtopic-plan.service';

describe('SubtopicPlanService', () => {
  let service: SubtopicPlanService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SubtopicPlanService],
    }).compile();

    service = module.get<SubtopicPlanService>(SubtopicPlanService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
