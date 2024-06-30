import { Auth } from "@/auth/decorators/auth.decorator";
import { CurrentUser } from "@/auth/decorators/user.decorator";
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { CourseService } from "./course.service";
import { CourseInput } from "./dto/course.input";
import { UpdateCourse } from "./dto/update-course.input";
import { Course } from "./entities/course.entity";

@Resolver(() => Course)
export class CourseResolver {
  constructor(private readonly courseService: CourseService) {}

  @Mutation(() => Course)
  @Auth("user")
  async createCourse(@CurrentUser("id") userId: string, @Args("createCourseData") createCourseData: CourseInput) {
    return this.courseService.createCourse(userId, createCourseData);
  }

  @Query(() => Course)
  @Auth("user")
  async getCourse(@CurrentUser("id") userId: string, @Args("id") id: string) {
    return this.courseService.getCourse(userId, id);
  }

  @Mutation(() => Course)
  @Auth("user")
  async updateCourse(@CurrentUser("id") userId: string, @Args("id") id: string, @Args("updateCourseData") updateCourseData: UpdateCourse) {
    return this.courseService.updateCourse(userId, id, updateCourseData);
  }

  @Mutation(() => Course)
  @Auth("user")
  async deleteCourse(@CurrentUser("id") userId: string, @Args("id") id: string) {
    return this.courseService.deleteCourse(userId, id);
  }
}
