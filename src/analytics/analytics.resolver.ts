import { Auth } from "@/auth/decorators/auth.decorator";
import { CurrentUser } from "@/auth/decorators/user.decorator";
import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { AnalyticsService } from "./analytics.service";
import { LearningSessionInput } from "./dto/analytics.input";
import { LearningSession } from "./entities/analytics.entity";

@Resolver()
export class AnalyticsResolver {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Mutation(() => LearningSession)
  @Auth("user")
  updateOrCreateLearningSession(@CurrentUser("id") userId: string, @Args("LearningSessionInput") LearningSessionInput: LearningSessionInput) {
    return this.analyticsService.updateOrCreateLearningSession(userId, LearningSessionInput);
  }

  // @Query(() => [Analytics], { name: "analytics" })
  // findAll() {
  //   return this.analyticsService.findAll();
  // }

  // @Query(() => Analytics, { name: "analytics" })
  // findOne(@Args("id", { type: () => Int }) id: number) {
  //   return this.analyticsService.findOne(id);
  // }

  // @Mutation(() => Analytics)
  // updateAnalytics(@Args("updateAnalyticsInput") updateAnalyticsInput: UpdateAnalyticsInput) {
  //   return this.analyticsService.update(updateAnalyticsInput.id, updateAnalyticsInput);
  // }

  // @Mutation(() => Analytics)
  // removeAnalytics(@Args("id", { type: () => Int }) id: number) {
  //   return this.analyticsService.remove(id);
  // }
}
