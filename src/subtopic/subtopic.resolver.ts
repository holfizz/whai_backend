import { Args, ID, Mutation, Query, Resolver } from "@nestjs/graphql";
import { UpdateSubtopicInput } from "./dto/update-subtopic.input";
import { Subtopic } from "./entities/subtopic.entity";
import { SubtopicService } from "./subtopic.service";
import { Auth } from "@/auth/decorators/auth.decorator";
import { SubtopicInput } from "@/subtopic/dto/create-subtopic.input";

@Resolver(() => Subtopic)
export class SubtopicResolver {
  constructor(private readonly subtopicService: SubtopicService) {}

  @Mutation(() => Subtopic)
  createSubtopic(@Args("createSubtopicInput") createSubtopicInput: SubtopicInput) {
    return this.subtopicService.createSubtopic(createSubtopicInput);
  }

  @Mutation(() => Subtopic)
  updateSubtopic(@Args("updateSubtopicInput") updateSubtopicInput: UpdateSubtopicInput) {
    return this.subtopicService.updateSubtopic(updateSubtopicInput.id, updateSubtopicInput);
  }

  @Mutation(() => Subtopic)
  deleteSubtopic(@Args("id", { type: () => ID }) id: string) {
    return this.subtopicService.deleteSubtopic(id);
  }

  @Query(() => Subtopic)
  @Auth("user")
  async getSubtopic(@Args("id") id: string) {
    return this.subtopicService.getSubtopic(id);
  }

  @Query(() => [Subtopic])
  @Auth("user")
  async getAllSubtopics(@Args("topicId") topicId: string) {
    return this.subtopicService.getAllSubtopics(topicId);
  }
}
