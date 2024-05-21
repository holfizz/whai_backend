import { Test, TestingModule } from '@nestjs/testing';
import { SubtopicPlanResolver } from './subtopic-plan.resolver';
import { SubtopicPlanService } from './subtopic-plan.service';

describe('SubtopicPlanResolver', () => {
  let resolver: SubtopicPlanResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SubtopicPlanResolver, SubtopicPlanService],
    }).compile();

    resolver = module.get<SubtopicPlanResolver>(SubtopicPlanResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
