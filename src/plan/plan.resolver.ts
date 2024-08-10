import { Auth } from "@/auth/decorators/auth.decorator";
import { CurrentUser } from "@/auth/decorators/user.decorator";
import { CoursePlanInput, CoursePlanWithAIInput } from "@/plan/dto/plan.input";
import { Args, ID, Mutation, Query, Resolver } from "@nestjs/graphql";
import { PubSub } from "graphql-subscriptions";
import { CoursePlan } from "./entities/plan.entity";
import { PlanService } from "./plan.service";

const pubSub = new PubSub();

@Resolver(() => CoursePlan)
export class PlanResolver {
  constructor(private readonly planService: PlanService) {}

  @Mutation(() => CoursePlan)
  @Auth("user")
  createPlan(@Args("createPlanInput") createPlanInput: CoursePlanInput) {
    return this.planService.createPlan(createPlanInput);
  }

  @Mutation(() => CoursePlan)
  @Auth("user")
  createPlanWithAI(@CurrentUser("id") userId: string, @Args("CoursePlanWithAIInput") dto: CoursePlanWithAIInput) {
    return this.planService.createPlanWithAI(userId, dto, pubSub);
  }

  @Query(() => CoursePlan)
  @Auth("user")
  getCoursePlan(@Args("planId", { type: () => ID }) planId: string) {
    return this.planService.getCoursePlan(planId);
  }

  @Mutation(() => CoursePlan)
  @Auth("user")
  async updatePlan(@Args("planId", { type: () => ID }) planId: string, @Args("updatePlanInput") updatePlanInput: CoursePlanInput) {
    return this.planService.updatePlan(planId, updatePlanInput);
  }
}
