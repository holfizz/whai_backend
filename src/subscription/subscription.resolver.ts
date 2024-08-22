import { Auth } from "@/auth/decorators/auth.decorator";
import { CurrentUser } from "@/auth/decorators/user.decorator";
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { SubscriptionType } from "@prisma/client";
import { SubscriptionInput } from "./dto/create-subscription.input";
import { ActivatedSubscriptionResponse, SubscriptionEntity } from "./entities/subscription.entity";
import { SubscriptionService } from "./subscription.service";

@Resolver(() => SubscriptionEntity)
export class SubscriptionResolver {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Mutation(() => SubscriptionEntity)
  @Auth("user")
  async createSubscription(@Args("data") data: SubscriptionInput, @CurrentUser("id") adminId: string) {
    return this.subscriptionService.createSubscription(adminId, data);
  }

  @Query(() => SubscriptionEntity, { name: "getSubscriptionByUserId" })
  @Auth("user")
  async getSubscriptionByUserId(@CurrentUser("id") userId: string) {
    return this.subscriptionService.getSubscriptionByUserId(userId);
  }

  @Query(() => SubscriptionEntity, { name: "getSubscription" })
  @Auth("user")
  async getSubscription(@Args("subscriptionType", { type: () => SubscriptionType }) subscriptionType: SubscriptionType) {
    return this.subscriptionService.getSubscriptionById(subscriptionType);
  }

  @Mutation(() => SubscriptionEntity)
  @Auth("user")
  async updateSubscription(
    @Args("subscriptionType", { type: () => SubscriptionType }) subscriptionType: SubscriptionType,
    @Args("data", { type: () => SubscriptionInput }) data: Partial<SubscriptionInput>,
  ) {
    return this.subscriptionService.updateSubscription(subscriptionType, data);
  }

  @Mutation(() => ActivatedSubscriptionResponse)
  @Auth("user")
  async activateSubscription(@CurrentUser("id") userId: string, @Args("subscriptionType", { type: () => SubscriptionType }) subscriptionType: SubscriptionType) {
    return this.subscriptionService.activateSubscription(userId, subscriptionType);
  }
}
