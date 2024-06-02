import { Auth } from "@/auth/decorators/auth.decorator";
import { CurrentUser } from "@/auth/decorators/user.decorator";
import { Args, Mutation, Query, Resolver, Subscription } from "@nestjs/graphql";
import { PubSub } from "graphql-subscriptions";
import { QuizInput, QuizWithAIInput } from "./dto/quiz.input";
import { Quiz } from "./entities/quiz.entity";
import { QuizService } from "./quiz.service";
const pubSub = new PubSub();

@Resolver(() => Quiz)
export class QuizResolver {
  constructor(private readonly quizService: QuizService) {}

  @Subscription(() => Quiz, {
    filter: (payload, variables) => {
      return payload.quizWithAIAnswer.conversation_id === variables.chatWithAIId;
    },
  })
  quizWithAIAnswer(@Args("chatWithAIId") chatWithAIId: string) {
    return pubSub.asyncIterator("quizWithAIAnswer");
  }
  @Mutation(() => Quiz)
  createQuiz(@Args("createQuizInput") createQuizInput: QuizInput) {
    return this.quizService.createQuiz(createQuizInput);
  }

  // @Query(() => [Quiz])
  // findAllQuizzes() {
  //   return this.quizService.findAllQuizzes();
  // }

  @Query(() => Quiz)
  findQuizById(@Args("id", { type: () => String }) id: string) {
    return this.quizService.findQuizById(id);
  }

  @Mutation(() => Quiz)
  deleteQuiz(@Args("id", { type: () => String }) id: string) {
    return this.quizService.deleteQuiz(id);
  }

  @Mutation(() => Quiz)
  updateQuiz(@Args("id", { type: () => String }) id: string, @Args("updateQuizData") updateQuizData: QuizInput) {
    return this.quizService.updateQuiz(id, updateQuizData);
  }
  chatWithAIAnswer(@Args("chatWithAIId") chatWithAIId: string) {
    return pubSub.asyncIterator("chatWithAIAnswer");
  }
  @Mutation(() => Quiz)
  @Auth("user")
  createQuizWithAI(@CurrentUser("id") userId: string, @Args("QuizWithAIInput") dto: QuizWithAIInput) {
    return this.quizService.createQuizWithAI(userId, dto, pubSub);
  }
  @Mutation(() => Boolean)
  @Auth("user")
  stopGeneration(@Args("conversationId", { type: () => String }) conversationId: string) {
    this.quizService.stopGeneration(conversationId);
    return true;
  }
}
