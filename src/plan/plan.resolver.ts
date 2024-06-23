import { Auth } from "@/auth/decorators/auth.decorator";
import { CurrentUser } from "@/auth/decorators/user.decorator";
import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { PubSub } from "graphql-subscriptions";
import { PlanInput, PlanWithAIInput } from "./dto/plan.input";
import { Plan } from "./entities/plan.entity";
import { PlanService } from "./plan.service";
const pubSub = new PubSub();
@Resolver(() => Plan)
export class PlanResolver {
  constructor(private readonly planService: PlanService) {}

  @Mutation(() => Plan)
  @Auth("user")
  createPlan(@Args("createPlanInput") createPlanInput: PlanInput) {
    return this.planService.createPlan(createPlanInput);
  }
  @Mutation(() => Plan)
  @Auth("user")
  createPlanWithAI(@CurrentUser("id") userId: string, @Args("QuizWithAIInput") dto: PlanWithAIInput) {
    return this.planService.createPlanWithAI(userId, dto, pubSub);
  }
}
