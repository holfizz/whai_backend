import { Auth } from "@/auth/decorators/auth.decorator";
import { CurrentUser } from "@/auth/decorators/user.decorator";
import { Args, ID, Mutation, Query, Resolver } from "@nestjs/graphql";
import { CourseAIHistoryInput } from "./dto/course_ai_history.Input";
import CourseAIHistoryService from "./course_ai_history.service";
import { CourseAIHistory } from "./entities/course_ai_history.entity";

@Resolver(CourseAIHistory)
export class CourseAIHistoryResolver {
  constructor(private readonly courseAIHistoryService: CourseAIHistoryService) {}

  @Mutation(() => CourseAIHistory)
  @Auth("user")
  async createCourseAIHistory(@CurrentUser("id") userId: string, @Args("createChatInput") createChatInput: CourseAIHistoryInput) {
    return this.courseAIHistoryService.createCourseAIHistory(userId, createChatInput);
  }

  @Query(() => [CourseAIHistory])
  @Auth("user")
  async getAllCourseAIHistory(
    @CurrentUser("id") userId: string,
    @Args("getAllCourseAIHistoryInput")
    dto: CourseAIHistoryInput,
  ) {
    return this.courseAIHistoryService.getAllCourseAIHistory(userId, dto);
  }

  @Query(() => CourseAIHistory)
  @Auth("user")
  async getCourseAIHistory(
    @Args("courseAIHistoryId", { type: () => ID })
    CourseAIHistoryID: string,
  ) {
    return this.courseAIHistoryService.getCourseAIHistory(CourseAIHistoryID);
  }
}
