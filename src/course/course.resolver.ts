import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { CourseService } from "./course.service";
import { CourseInput } from "./dto/course.input";
import { UpdateCourse } from "./dto/update-course.input";
import { Course } from "./entities/course.entity";

@Resolver(() => Course)
export class CourseResolver {
  constructor(private readonly courseService: CourseService) {}

  @Mutation(() => Course)
  async createCourse(@Args("createCourseData") createCourseData: CourseInput) {
    return this.courseService.createCourse(createCourseData);
  }

  @Query(() => Course)
  async course(@Args("id") id: string) {
    return this.courseService.getCourse(id);
  }

  @Mutation(() => Course)
  async updateCourse(@Args("id") id: string, @Args("updateCourseData") updateCourseData: UpdateCourse) {
    return this.courseService.updateCourse(id, updateCourseData);
  }

  @Mutation(() => Course)
  async deleteCourse(@Args("id") id: string) {
    return this.courseService.deleteCourse(id);
  }
}
