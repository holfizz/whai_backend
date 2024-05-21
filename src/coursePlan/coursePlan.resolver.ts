import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { CoursePlanService } from "./coursePlan.service";
import { CoursePlan } from "./entities/coursePlan.entity";

@Resolver(() => CoursePlan)
export class CoursePlanResolver {
  constructor(private readonly coursePlanService: CoursePlanService) {}

  @Mutation(() => CoursePlan)
  createCoursePlan(@Args("createPlanInput") createPlanInput) {
    return this.coursePlanService.create(createPlanInput);
  }
}
