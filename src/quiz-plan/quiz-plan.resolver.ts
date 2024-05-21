import { Args, Int, Mutation, Query, Resolver } from "@nestjs/graphql";
import { CreateQuizPlanInput } from "./dto/create-quiz-plan.input";
import { QuizPlan } from "./entities/quiz-plan.entity";
import { QuizPlanService } from "./quiz-plan.service";

@Resolver(() => QuizPlan)
export class QuizPlanResolver {
  constructor(private readonly quizPlanService: QuizPlanService) {}

  @Mutation(() => QuizPlan)
  createQuizPlan(@Args("createQuizPlanInput") createQuizPlanInput: CreateQuizPlanInput) {
    return this.quizPlanService.create(createQuizPlanInput);
  }

  @Query(() => [QuizPlan], { name: "quizPlan" })
  findAll() {
    return this.quizPlanService.findAll();
  }

  @Query(() => QuizPlan, { name: "quizPlan" })
  findOne(@Args("id", { type: () => Int }) id: number) {
    return this.quizPlanService.findOne(id);
  }

  // @Mutation(() => QuizPlan)
  // updateQuizPlan(@Args('updateQuizPlanInput') updateQuizPlanInput: UpdateQuizPlanInput) {
  //   return this.quizPlanService.update(updateQuizPlanInput.id, updateQuizPlanInput);
  // }

  @Mutation(() => QuizPlan)
  removeQuizPlan(@Args("id", { type: () => Int }) id: number) {
    return this.quizPlanService.remove(id);
  }
}
