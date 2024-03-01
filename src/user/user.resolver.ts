import { Auth } from "@/auth/decorators/auth.decorator";
import { CurrentUser } from "@/auth/decorators/user.decorator";
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { FileUpload, GraphQLUpload } from "graphql-upload-ts";
import { UpdateUserInput } from "./dto/update-user.input";
import { User } from "./entities/user.entity";
import { UserService } from "./user.service";

@Resolver()
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => User)
  @Auth("user")
  async getProfile(@CurrentUser("id") id: number) {
    return this.userService.byId(id);
  }

  @Mutation(() => User)
  @Auth("user")
  async updateProfile(
    @CurrentUser("id") id: number,
    @Args("dto") dto: UpdateUserInput,
    @Args("picture", { type: () => GraphQLUpload, nullable: true }) picture: Promise<FileUpload>,
  ): Promise<User> {
    console.log(id);
    return this.userService.updateProfile(id, dto, picture);
  }
}
