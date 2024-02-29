import { Auth } from "@/auth/decorators/auth.decorator";
import { CurrentUser } from "@/auth/decorators/user.decorator";
import { UploadedFiles, UseInterceptors, UsePipes, ValidationPipe } from "@nestjs/common";
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { FileInput } from "./dto/file.input";
import { UpdateUserInput } from "./dto/update-user.input";
import { User } from "./dto/user.module";
import { UserService } from "./user.service";

@Resolver()
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => User)
  @Auth("user")
  async profile(@CurrentUser("id") id: number) {
    return this.userService.byId(id);
  }

  @Mutation(() => User)
  @UsePipes(new ValidationPipe())
  @UseInterceptors(FileFieldsInterceptor([{ name: "picture", maxCount: 1 }]))
  @Auth("user")
  async updateProfile(
    @CurrentUser("id") id: number,
    @Args("dto") dto: UpdateUserInput,
    @Args("files", { nullable: true })
    @UploadedFiles()
    files?: FileInput,
  ): Promise<User> {
    let picture;
    if (files && files.picture && files.picture.fieldName.length > 0) {
      picture = files.picture[0];
    }
    return this.userService.updateProfile(id, dto, picture);
  }
}
