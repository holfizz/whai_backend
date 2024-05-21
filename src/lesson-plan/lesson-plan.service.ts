import { Injectable } from '@nestjs/common';
import { CreateLessonPlanInput } from './dto/create-lesson-plan.input';
import { UpdateLessonPlanInput } from './dto/update-lesson-plan.input';

@Injectable()
export class LessonPlanService {
  create(createLessonPlanInput: CreateLessonPlanInput) {
    return 'This action adds a new lessonPlan';
  }

  findAll() {
    return `This action returns all lessonPlan`;
  }

  findOne(id: number) {
    return `This action returns a #${id} lessonPlan`;
  }

  update(id: number, updateLessonPlanInput: UpdateLessonPlanInput) {
    return `This action updates a #${id} lessonPlan`;
  }

  remove(id: number) {
    return `This action removes a #${id} lessonPlan`;
  }
}
