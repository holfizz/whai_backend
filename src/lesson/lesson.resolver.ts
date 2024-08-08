import { Auth } from "@/auth/decorators/auth.decorator";
import { CurrentUser } from "@/auth/decorators/user.decorator";
import { Args, ID, Mutation, Query, Resolver } from "@nestjs/graphql";
import { PubSub } from "graphql-subscriptions";
import { LessonInput, LessonWithAIInput, LessonWithAITasksBlocksInput } from "./dto/lesson.input";
import { UpdateLesson } from "./dto/update-lesson.input";
import { Lesson } from "./entities/lesson.entity";
import { LessonService } from "./lesson.service";

const pubSub = new PubSub();

@Resolver(() => Lesson)
export class LessonResolver {
  constructor(private readonly lessonService: LessonService) {}

  @Mutation(() => Lesson)
  @Auth("user")
  async createLesson(@Args("createLessonInput") createLessonInput: LessonInput) {
    return this.lessonService.createLesson(createLessonInput);
  }

  @Mutation(() => Lesson)
  @Auth("user")
  async updateLesson(@Args("updateLessonInput") updateLessonInput: UpdateLesson) {
    return this.lessonService.updateLesson(updateLessonInput.id, updateLessonInput);
  }

  @Mutation(() => Lesson)
  @Auth("user")
  async deleteLesson(@Args("id", { type: () => ID }) id: string) {
    return this.lessonService.deleteLesson(id);
  }

  @Query(() => Lesson)
  @Auth("user")
  async getLesson(@Args("lessonId", { type: () => ID }) lessonId: string) {
    return this.lessonService.getLesson(lessonId);
  }

  @Query(() => [Lesson])
  @Auth("user")
  async getAllLessons(@Args("subtopicId", { type: () => ID }) subtopicId: string) {
    return this.lessonService.getAllLessons(subtopicId);
  }

  @Query(() => Lesson, { nullable: true })
  @Auth("user")
  async findLessonById(@Args("lessonId", { type: () => ID }) lessonId: string) {
    return this.lessonService.findLessonById(lessonId);
  }

  @Query(() => [Lesson])
  @Auth("user")
  async findAllLessons(@Args("subtopicId", { type: () => ID }) subtopic: string) {
    return this.lessonService.findAllLessons(subtopic);
  }

  @Mutation(() => Lesson)
  @Auth("user")
  async createLessonWithAI(@CurrentUser("id") userId: string, @Args("createLessonWithAIInput") createLessonWithAIInput: LessonWithAIInput) {
    return this.lessonService.createLessonWithAI(userId, createLessonWithAIInput, pubSub);
  }

  @Mutation(() => Lesson)
  @Auth("user")
  async createLessonFromAI(@Args("lessonWithAITasksBlocksInput") lessonWithAITasksBlocksInput: LessonWithAITasksBlocksInput) {
    return this.lessonService.createLessonFromAI(lessonWithAITasksBlocksInput);
  }
}
