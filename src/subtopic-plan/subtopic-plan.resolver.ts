import { Args, Int, Mutation, Query, Resolver } from "@nestjs/graphql";
import { CreateSubtopicPlanInput } from "./dto/create-subtopic-plan.input";
import { SubtopicPlan } from "./entities/subtopic-plan.entity";
import { SubtopicPlanService } from "./subtopic-plan.service";

@Resolver(() => SubtopicPlan)
export class SubtopicPlanResolver {
  constructor(private readonly subtopicPlanService: SubtopicPlanService) {}

  @Mutation(() => SubtopicPlan)
  createSubtopicPlan(@Args("createSubtopicPlanInput") createSubtopicPlanInput: CreateSubtopicPlanInput) {
    return this.subtopicPlanService.create(createSubtopicPlanInput);
  }

  @Query(() => [SubtopicPlan], { name: "subtopicPlan" })
  findAll() {
    return this.subtopicPlanService.findAll();
  }

  @Query(() => SubtopicPlan, { name: "subtopicPlan" })
  findOne(@Args("id", { type: () => Int }) id: number) {
    return this.subtopicPlanService.findOne(id);
  }

  // @Mutation(() => SubtopicPlan)
  // updateSubtopicPlan(@Args('updateSubtopicPlanInput') updateSubtopicPlanInput: UpdateSubtopicPlanInput) {
  //   return this.subtopicPlanService.update(updateSubtopicPlanInput.id, updateSubtopicPlanInput);
  // }

  @Mutation(() => SubtopicPlan)
  removeSubtopicPlan(@Args("id", { type: () => Int }) id: number) {
    return this.subtopicPlanService.remove(id);
  }
}
