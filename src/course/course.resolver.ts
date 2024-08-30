import { Auth } from "@/auth/decorators/auth.decorator";
import { CurrentUser } from "@/auth/decorators/user.decorator";
import { Args, ID, Mutation, Query, Resolver } from "@nestjs/graphql";
import { FileUpload, GraphQLUpload } from "graphql-upload-ts";
import { CourseService } from "./course.service";
import { CourseInput } from "./dto/course.input";
import { UpdateCourse } from "./dto/update-course.input";
import { Course } from "./entities/course.entity";

@Resolver(() => Course)
export class CourseResolver {
  constructor(private readonly courseService: CourseService) {}

  @Mutation(() => Course)
  @Auth("user")
  async createCourse(
    @CurrentUser("id") userId: string,
    @Args("createCourseData") createCourseData?: CourseInput,
    @Args("image", { type: () => GraphQLUpload, nullable: true }) image?: FileUpload | null,
  ) {
    let uploadedImage: FileUpload | null = null;

    if (image) {
      uploadedImage = await image;
    }

    return this.courseService.createCourse(userId, createCourseData, uploadedImage);
  }

  @Query(() => Course)
  @Auth("user")
  async getCourse(@CurrentUser("id") userId: string, @Args("courseId", { type: () => ID }) courseId: string) {
    return this.courseService.getCourse(userId, courseId);
  }

  @Query(() => [Course])
  @Auth("user")
  async getAllCourses(@CurrentUser("id") userId: string) {
    return this.courseService.getAllCourses(userId);
  }

  @Query(() => Course, { nullable: true })
  @Auth("user")
  async getLastCourse(@CurrentUser("id") userId: string) {
    return this.courseService.getLastCourse(userId);
  }

  @Mutation(() => Course)
  @Auth("user")
  async updateCourse(
    @CurrentUser("id") userId: string,
    @Args("id", { type: () => ID }) id: string,
    @Args("updateCourseData") updateCourseData: UpdateCourse,
    @Args("image", { type: () => GraphQLUpload, nullable: true }) image?: FileUpload | null,
  ) {
    const uploadedImage = image ? await image : null;

    return this.courseService.updateCourse(userId, id, updateCourseData, uploadedImage);
  }

  @Mutation(() => Course)
  @Auth("user")
  async deleteCourse(@CurrentUser("id") userId: string, @Args("id") id: string) {
    return this.courseService.deleteCourse(userId, id);
  }

  @Mutation(() => Course)
  @Auth("user")
  async createCourseLink(@CurrentUser("id") userId: string, @Args("id") id: string) {
    return this.courseService.deleteCourse(userId, id);
  }
}
