import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { CoursePlanService } from "./coursePlan.service";
import { CreateCoursePlanInput } from "./dto/create-coursePlan.input";
import { CoursePlan } from "./entities/coursePlan.entity";

@Resolver(() => CoursePlan)
export class CoursePlanResolver {
  constructor(private readonly coursePlanService: CoursePlanService) {}

  @Mutation(() => CoursePlan)
  createCoursePlan(@Args("createPlanInput") createPlanInput: CreateCoursePlanInput) {
    return this.coursePlanService.create(createPlanInput);
  }
}
