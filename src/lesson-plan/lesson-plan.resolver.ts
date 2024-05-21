import { Args, Int, Mutation, Resolver } from "@nestjs/graphql";
import { CreateLessonPlanInput } from "./dto/create-lesson-plan.input";
import { LessonPlan } from "./entities/lesson-plan.entity";
import { LessonPlanService } from "./lesson-plan.service";

@Resolver(() => LessonPlan)
export class LessonPlanResolver {
  constructor(private readonly lessonPlanService: LessonPlanService) {}

  @Mutation(() => LessonPlan)
  createLessonPlan(@Args("createLessonPlanInput") createLessonPlanInput: CreateLessonPlanInput) {
    return this.lessonPlanService.create(createLessonPlanInput);
  }

  // @Mutation(() => LessonPlan)
  // updateLessonPlan(@Args("updateLessonPlanInput") updateLessonPlanInput: UpdateLessonPlanInput) {
  //   return this.lessonPlanService.update(updateLessonPlanInput.id, updateLessonPlanInput);
  // }

  @Mutation(() => LessonPlan)
  removeLessonPlan(@Args("id", { type: () => Int }) id: number) {
    return this.lessonPlanService.remove(id);
  }
}
