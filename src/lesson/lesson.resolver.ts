import { Args, ID, Mutation, Resolver } from "@nestjs/graphql";
import { LessonInput } from "./dto/lesson.input";
import { UpdateLesson } from "./dto/update-lesson.input";
import { Lesson } from "./entities/lesson.entity";
import { LessonService } from "./lesson.service";

@Resolver(() => Lesson)
export class LessonResolver {
  constructor(private readonly lessonService: LessonService) {}

  @Mutation(() => Lesson)
  async createLesson(@Args("createLessonInput") createLessonInput: LessonInput) {
    return this.lessonService.createLesson(createLessonInput);
  }

  @Mutation(() => Lesson)
  async updateLesson(@Args("id") id: string, @Args("updateLessonInput") updateLessonInput: UpdateLesson) {
    return this.lessonService.updateLesson(id, updateLessonInput);
  }

  @Mutation(() => Lesson)
  async deleteLesson(@Args("id", { type: () => ID }) id: string) {
    return this.lessonService.deleteLesson(id);
  }
}
