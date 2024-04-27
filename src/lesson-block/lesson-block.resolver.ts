import { Args, ID, Mutation, Resolver } from "@nestjs/graphql";
import { LessonBlockInput } from "./dto/lesson-block.input";
import { UpdateLessonBlock } from "./dto/update-lesson-block.input";
import { LessonBlock } from "./entities/lesson-block.entity";
import { LessonBlockService } from "./lesson-block.service";

@Resolver(() => LessonBlock)
export class LessonBlockResolver {
  constructor(private readonly lessonBlockService: LessonBlockService) {}

  @Mutation(() => LessonBlock)
  createLessonBlock(@Args("createLessonBlockInput") createLessonBlockInput: LessonBlockInput) {
    return this.lessonBlockService.createLessonBlock(createLessonBlockInput);
  }

  @Mutation(() => LessonBlock)
  async updateLessonBlock(@Args("id") id: string, @Args("updateLessonBlock") updateLessonBlock: UpdateLessonBlock) {
    return this.lessonBlockService.updateLessonBlock(id, updateLessonBlock);
  }

  @Mutation(() => LessonBlock)
  async deleteLessonBlock(@Args("id", { type: () => ID }) id: string) {
    return this.lessonBlockService.deleteLessonBlock(id);
  }
}
