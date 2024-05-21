import { Injectable } from '@nestjs/common';
import { CreateModulePlanInput } from './dto/create-module-plan.input';
import { UpdateModulePlanInput } from './dto/update-module-plan.input';

@Injectable()
export class ModulePlanService {
  create(createModulePlanInput: CreateModulePlanInput) {
    return 'This action adds a new modulePlan';
  }

  findAll() {
    return `This action returns all modulePlan`;
  }

  findOne(id: number) {
    return `This action returns a #${id} modulePlan`;
  }

  update(id: number, updateModulePlanInput: UpdateModulePlanInput) {
    return `This action updates a #${id} modulePlan`;
  }

  remove(id: number) {
    return `This action removes a #${id} modulePlan`;
  }
}
