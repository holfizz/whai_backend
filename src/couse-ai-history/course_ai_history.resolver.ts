import { Auth } from "@/auth/decorators/auth.decorator";
import { CurrentUser } from "@/auth/decorators/user.decorator";
import { Args, ID, Mutation, Query, Resolver } from "@nestjs/graphql";

import CourseAIHistoryService from "./course_ai_history.service";
import { CourseAIHistory } from "./entities/course_ai_history.entity";

@Resolver(CourseAIHistory)
export class CourseAIHistoryResolver {
  constructor(private readonly courseAIHistoryService: CourseAIHistoryService) {}

  @Mutation(() => CourseAIHistory)
  @Auth("user")
  async createCourseAIHistory(@CurrentUser("id") userId: string, @Args("courseId", { type: () => ID }) courseId: string) {
    return this.courseAIHistoryService.createCourseAIHistory(userId, courseId);
  }

  @Query(() => CourseAIHistory)
  @Auth("user")
  async getCourseAIHistoryByCourseId(
    @CurrentUser("id") userId: string,
    @Args("courseId", { type: () => ID })
    courseId: string,
  ) {
    return this.courseAIHistoryService.getCourseAIHistoryByCourseId(userId, courseId);
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
