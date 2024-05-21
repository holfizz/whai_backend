import { Args, Int, Mutation, Query, Resolver } from "@nestjs/graphql";
import { CreateModulePlanInput } from "./dto/create-module-plan.input";
import { ModulePlan } from "./entities/module-plan.entity";
import { ModulePlanService } from "./module-plan.service";

@Resolver(() => ModulePlan)
export class ModulePlanResolver {
  constructor(private readonly modulePlanService: ModulePlanService) {}

  @Mutation(() => ModulePlan)
  createModulePlan(@Args("createModulePlanInput") createModulePlanInput: CreateModulePlanInput) {
    return this.modulePlanService.create(createModulePlanInput);
  }

  @Query(() => [ModulePlan], { name: "modulePlan" })
  findAll() {
    return this.modulePlanService.findAll();
  }

  @Query(() => ModulePlan, { name: "modulePlan" })
  findOne(@Args("id", { type: () => Int }) id: number) {
    return this.modulePlanService.findOne(id);
  }

  // @Mutation(() => ModulePlan)
  // updateModulePlan(@Args('updateModulePlanInput') updateModulePlanInput: UpdateModulePlanInput) {
  //   return this.modulePlanService.update(updateModulePlanInput.id, updateModulePlanInput);
  // }

  @Mutation(() => ModulePlan)
  removeModulePlan(@Args("id", { type: () => Int }) id: number) {
    return this.modulePlanService.remove(id);
  }
}
