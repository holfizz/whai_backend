import { Auth } from "@/auth/decorators/auth.decorator";
import { CurrentUser } from "@/auth/decorators/user.decorator";
import { Args, ID, Mutation, Query, Resolver } from "@nestjs/graphql";
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

  @Query(() => SubscriptionEntity)
  @Auth("user")
  async getSubscriptionByUserId(@CurrentUser("id") userId: string) {
    return this.subscriptionService.getSubscriptionByUserId(userId);
  }

  @Query(() => SubscriptionEntity)
  @Auth("user")
  async getSubscription(@Args("subscriptionId", { type: () => ID }) subscriptionId: string) {
    return this.subscriptionService.getSubscriptionById(subscriptionId);
  }

  @Mutation(() => SubscriptionEntity)
  @Auth("user")
  async updateSubscription(@Args("subscriptionId", { type: () => ID }) subscriptionId: string, @Args("data", { type: () => SubscriptionInput }) data: Partial<SubscriptionInput>) {
    return this.subscriptionService.updateSubscription(subscriptionId, data);
  }

  @Mutation(() => ActivatedSubscriptionResponse)
  @Auth("user")
  async activateSubscription(@CurrentUser("id") userId: string, @Args("subscriptionType", { type: () => SubscriptionType }) subscriptionType: SubscriptionType) {
    return this.subscriptionService.activateSubscription(userId, subscriptionType);
  }
}
