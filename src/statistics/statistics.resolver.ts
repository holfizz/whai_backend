import { Query, Resolver } from "@nestjs/graphql";
import { UserRegistrationStats } from "./entites/statistics.entitie";
import { StatisticsService } from "./statistics.service";

@Resolver()
export class StatisticsResolver {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Query(() => [UserRegistrationStats])
  async getUserRegistrationsByMonth() {
    return this.statisticsService.getUserRegistrationsByMonth();
  }
}
