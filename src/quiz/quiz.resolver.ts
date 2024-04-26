import { Args, Int, Mutation, Query, Resolver } from "@nestjs/graphql";
import { CreateQuizInput } from "./dto/quiz.input";
import { Quiz } from "./entities/quiz.entity";
import { QuizService } from "./quiz.service";

@Resolver(() => Quiz)
export class QuizResolver {
  constructor(private readonly quizService: QuizService) {}

  @Mutation(() => Quiz)
  createQuiz(@Args("createQuizInput") createQuizInput: CreateQuizInput) {
    return this.quizService.createQuiz(createQuizInput);
  }

  @Query(() => [Quiz])
  findAllQuizzes() {
    return this.quizService.findAllQuizzes();
  }

  @Query(() => Quiz)
  findQuizById(@Args("id", { type: () => Int }) id: number) {
    return this.quizService.findQuizById(id);
  }

  @Mutation(() => Quiz)
  deleteQuiz(@Args("id", { type: () => Int }) id: number) {
    return this.quizService.deleteQuiz(id);
  }

  @Mutation(() => Quiz)
  updateQuiz(@Args("id", { type: () => Int }) id: number, @Args("updateQuizData") updateQuizData: CreateQuizInput) {
    return this.quizService.updateQuiz(id, updateQuizData);
  }
}
