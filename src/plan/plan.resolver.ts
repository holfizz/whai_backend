import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { PlanInput } from "./dto/plan.input";
import { Plan } from "./entities/plan.entity";
import { PlanService } from "./plan.service";

@Resolver(() => Plan)
export class PlanResolver {
  constructor(private readonly coursePlanService: PlanService) {}

  @Mutation(() => Plan)
  createPlan(@Args("createPlanInput") createPlanInput: PlanInput) {
    return this.coursePlanService.createPlan(createPlanInput);
  }
}
