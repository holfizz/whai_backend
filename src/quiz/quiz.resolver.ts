import { Auth } from "@/auth/decorators/auth.decorator";
import { CurrentUser } from "@/auth/decorators/user.decorator";
import { Args, ID, Mutation, Query, Resolver, Subscription } from "@nestjs/graphql";
import { PubSub } from "graphql-subscriptions";
import { QuizInput, QuizWithAIInput, SaveQuizResultInput } from "./dto/quiz.input";
import { Quiz, QuizDetails, QuizResult, QuizSummary } from "./entities/quiz.entity";
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
  @Auth("user")
  quizWithAIAnswer(@Args("chatWithAIId") chatWithAIId: string) {
    return pubSub.asyncIterator("quizWithAIAnswer");
  }

  @Mutation(() => Quiz)
  @Auth("user")
  createQuiz(@Args("createQuizInput") createQuizInput: QuizInput) {
    return this.quizService.createQuiz(createQuizInput);
  }

  @Query(() => QuizDetails)
  @Auth("user")
  getQuiz(@CurrentUser("id") userId: string, @Args("quizId", { type: () => ID }) quizId: string) {
    return this.quizService.getQuiz(quizId, userId);
  }

  @Query(() => [QuizSummary])
  @Auth("user")
  getAllQuizzes(@Args("subtopicId", { type: () => ID }) subtopicId: string) {
    return this.quizService.getAllQuizzes(subtopicId);
  }

  @Mutation(() => Quiz)
  deleteQuiz(@Args("id", { type: () => ID }) id: string) {
    return this.quizService.deleteQuiz(id);
  }

  @Mutation(() => Quiz)
  updateQuiz(@Args("id", { type: () => String }) id: string, @Args("updateQuizData") updateQuizData: QuizInput) {
    return this.quizService.updateQuiz(id, updateQuizData);
  }

  @Subscription(() => Quiz, {
    filter: (payload, variables) => {
      return payload.chatWithAIAnswer.conversation_id === variables.chatWithAIId;
    },
  })
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

  @Mutation(() => QuizResult)
  @Auth("user")
  saveQuizResult(@CurrentUser("id") userId: string, @Args("saveQuizResultInput") input: SaveQuizResultInput) {
    return this.quizService.saveQuizResult(userId, input);
  }
}
