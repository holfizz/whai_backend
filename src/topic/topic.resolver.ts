import { Auth } from "@/auth/decorators/auth.decorator";
import { Args, ID, Mutation, Query, Resolver } from "@nestjs/graphql";
import { TopicInput } from "./dto/create-topic.input"; // Импортируем DTO
import { UpdateTopicInput } from "./dto/update-topic.input";
import { Topic } from "./entities/topic.entity";
import { TopicService } from "./topic.service";

@Resolver(() => Topic)
export class TopicResolver {
  constructor(private readonly topicService: TopicService) {}

  @Mutation(() => Topic)
  createTopic(@Args("createTopicInput") createTopicInput: TopicInput) {
    return this.topicService.createTopic(createTopicInput);
  }

  @Mutation(() => Topic)
  updateTopic(@Args("topicId", { type: () => ID }) id: string, @Args("updateTopicInput") updateTopicInput: UpdateTopicInput) {
    return this.topicService.updateTopic(id, updateTopicInput);
  }

  @Mutation(() => Topic)
  deleteTopic(@Args("topicId", { type: () => ID }) id: string) {
    return this.topicService.deleteTopic(id);
  }

  @Query(() => Topic)
  @Auth("user")
  async getTopic(@Args("topicId", { type: () => ID }) id: string) {
    return this.topicService.getTopic(id);
  }

  @Query(() => [Topic])
  @Auth("user")
  async getAllTopics(@Args("courseId", { type: () => ID }) courseId: string) {
    return this.topicService.getAllTopics(courseId);
  }
}
