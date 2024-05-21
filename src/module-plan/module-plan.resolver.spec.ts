import { Test, TestingModule } from '@nestjs/testing';
import { ModulePlanResolver } from './module-plan.resolver';
import { ModulePlanService } from './module-plan.service';

describe('ModulePlanResolver', () => {
  let resolver: ModulePlanResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ModulePlanResolver, ModulePlanService],
    }).compile();

    resolver = module.get<ModulePlanResolver>(ModulePlanResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
