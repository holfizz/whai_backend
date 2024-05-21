import { Module } from '@nestjs/common';
import { ModulePlanService } from './module-plan.service';
import { ModulePlanResolver } from './module-plan.resolver';

@Module({
  providers: [ModulePlanResolver, ModulePlanService],
})
export class ModulePlanModule {}
