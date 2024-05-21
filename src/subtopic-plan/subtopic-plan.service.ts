import { Injectable } from '@nestjs/common';
import { CreateSubtopicPlanInput } from './dto/create-subtopic-plan.input';
import { UpdateSubtopicPlanInput } from './dto/update-subtopic-plan.input';

@Injectable()
export class SubtopicPlanService {
  create(createSubtopicPlanInput: CreateSubtopicPlanInput) {
    return 'This action adds a new subtopicPlan';
  }

  findAll() {
    return `This action returns all subtopicPlan`;
  }

  findOne(id: number) {
    return `This action returns a #${id} subtopicPlan`;
  }

  update(id: number, updateSubtopicPlanInput: UpdateSubtopicPlanInput) {
    return `This action updates a #${id} subtopicPlan`;
  }

  remove(id: number) {
    return `This action removes a #${id} subtopicPlan`;
  }
}
