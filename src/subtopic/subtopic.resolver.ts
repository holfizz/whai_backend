import { Auth } from "@/auth/decorators/auth.decorator";
import { SubtopicInput } from "@/subtopic/dto/create-subtopic.input";
import { Args, ID, Mutation, Query, Resolver } from "@nestjs/graphql";
import { UpdateSubtopicInput } from "./dto/update-subtopic.input";
import { Subtopic } from "./entities/subtopic.entity";
import { SubtopicService } from "./subtopic.service";

@Resolver(() => Subtopic)
export class SubtopicResolver {
  constructor(private readonly subtopicService: SubtopicService) {}

  @Mutation(() => Subtopic)
  createSubtopic(@Args("createSubtopicInput") createSubtopicInput: SubtopicInput) {
    return this.subtopicService.createSubtopic(createSubtopicInput);
  }

  @Mutation(() => Subtopic)
  updateSubtopic(@Args("subtopicId") subtopicId: string, @Args("updateSubtopicInput") updateSubtopicInput: UpdateSubtopicInput) {
    return this.subtopicService.updateSubtopic(subtopicId, updateSubtopicInput);
  }

  @Mutation(() => Subtopic)
  deleteSubtopic(@Args("subtopicId", { type: () => ID }) subtopicId: string) {
    return this.subtopicService.deleteSubtopic(subtopicId);
  }

  @Query(() => Subtopic)
  @Auth("user")
  async getSubtopic(@Args("subtopicId", { type: () => ID }) subtopicId: string) {
    return this.subtopicService.getSubtopic(subtopicId);
  }

  @Query(() => [Subtopic])
  @Auth("user")
  async getAllSubtopics(@Args("topicId", { type: () => ID }) topicId: string) {
    return this.subtopicService.getAllSubtopics(topicId);
  }
}
