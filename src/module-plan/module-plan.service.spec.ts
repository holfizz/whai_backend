import { Test, TestingModule } from '@nestjs/testing';
import { ModulePlanService } from './module-plan.service';

describe('ModulePlanService', () => {
  let service: ModulePlanService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ModulePlanService],
    }).compile();

    service = module.get<ModulePlanService>(ModulePlanService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
