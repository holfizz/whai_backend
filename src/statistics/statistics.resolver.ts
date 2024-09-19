import { Auth } from "@/auth/decorators/auth.decorator";
import { CurrentUser } from "@/auth/decorators/user.decorator";
import { Query, Resolver } from "@nestjs/graphql";
import { UserCountStat, UserRegistrationStats } from "./entites/statistics.entitie";
import { StatisticsService } from "./statistics.service";

@Resolver()
export class StatisticsResolver {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Query(() => [UserRegistrationStats])
  @Auth("user")
  async getUserRegistrationsByMonth(@CurrentUser("id") userId: string) {
    return this.statisticsService.getUserRegistrationsByMonth(userId);
  }
  @Query(() => [UserCountStat])
  @Auth("user")
  async getUserCounts(@CurrentUser("id") userId: string): Promise<UserCountStat[]> {
    return this.statisticsService.getNumbers(userId);
  }
}
