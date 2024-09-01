import { Args, ID, Mutation, Query, Resolver } from "@nestjs/graphql";

import { Auth } from "@/auth/decorators/auth.decorator";
import { CurrentUser } from "@/auth/decorators/user.decorator";
import { PubSub } from "graphql-subscriptions";
import { FileUpload, GraphQLUpload } from "graphql-upload-ts";
import { CheckHomeworkDto, LessonTasksInput } from "./dto/lesson-task.input";
import { UpdateLessonTasks } from "./dto/update-lesson-task.input";
import { LessonHomeworkResponse, LessonTasks } from "./entities/lesson-task.entity";
import { LessonTasksService } from "./lesson-tasks.service";
const pubSub = new PubSub();

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

  @Mutation(() => [LessonHomeworkResponse])
  @Auth("user")
  async checkHomework(
    @Args("checkHomeworkDto") checkHomeworkDto: CheckHomeworkDto,
    @CurrentUser("id") userId: string,
    @Args("file", { type: () => GraphQLUpload, nullable: true }) image?: FileUpload | null,
  ) {
    let uploadedFile: FileUpload | null = null;

    if (image) {
      uploadedFile = await image;
    }

    return this.lessonTasksService.checkHomework(checkHomeworkDto, uploadedFile, pubSub, userId);
  }
}
