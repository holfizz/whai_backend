import { Args, ID, Mutation, Query, Resolver } from "@nestjs/graphql";

import { LessonTasksInput } from "./dto/lesson-task.input";
import { UpdateLessonTasks } from "./dto/update-lesson-task.input";
import { LessonTasks } from "./entities/lesson-task.entity";
import { LessonTasksService } from "./lesson-tasks.service";

@Resolver(() => LessonTasks)
export class LessonTasksResolver {
  constructor(private readonly lessonTasksService: LessonTasksService) {}

  @Mutation(() => LessonTasks)
  createLessonTask(@Args("createLessonTaskInput") createLessonTaskInput: LessonTasksInput) {
    return this.lessonTasksService.createLessonTask(createLessonTaskInput);
  }

  @Mutation(() => LessonTasks)
  async updateLessonTask(@Args("id") id: string, @Args("updateLessonTask") updateLessonTask: UpdateLessonTasks) {
    return this.lessonTasksService.updateLessonTask(id, updateLessonTask);
  }

  @Mutation(() => LessonTasks)
  async deleteLessonTask(@Args("id", { type: () => ID }) id: string) {
    return this.lessonTasksService.deleteLessonTask(id);
  }

  @Query(() => [LessonTasks])
  async getAllTasksByLessonId(@Args("lessonId", { type: () => ID }) lessonId: string) {
    return this.lessonTasksService.getAllTasksByLessonId(lessonId);
  }
}
