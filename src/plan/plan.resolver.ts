import { Auth } from "@/auth/decorators/auth.decorator";
import { CurrentUser } from "@/auth/decorators/user.decorator";
import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { PubSub } from "graphql-subscriptions";
import { CoursePlan } from "./entities/plan.entity";
import { PlanService } from "./plan.service";
import { CoursePlanInput, CoursePlanWithAIInput } from "@/plan/dto/plan.input";

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
}
