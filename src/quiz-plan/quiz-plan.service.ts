import { Injectable } from '@nestjs/common';
import { CreateQuizPlanInput } from './dto/create-quiz-plan.input';
import { UpdateQuizPlanInput } from './dto/update-quiz-plan.input';

@Injectable()
export class QuizPlanService {
  create(createQuizPlanInput: CreateQuizPlanInput) {
    return 'This action adds a new quizPlan';
  }

  findAll() {
    return `This action returns all quizPlan`;
  }

  findOne(id: number) {
    return `This action returns a #${id} quizPlan`;
  }

  update(id: number, updateQuizPlanInput: UpdateQuizPlanInput) {
    return `This action updates a #${id} quizPlan`;
  }

  remove(id: number) {
    return `This action removes a #${id} quizPlan`;
  }
}
