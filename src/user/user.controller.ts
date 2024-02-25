import { Body, Controller, Get, HttpCode, Put, UploadedFiles, UseInterceptors, UsePipes, ValidationPipe } from "@nestjs/common";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { Auth } from "../auth/decorators/auth.decorator";
import { CurrentUser } from "../auth/decorators/user.decorator";
import { UpdateUserDto } from "./dto/user.dto";
import { UserService } from "./user.service";

@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get("profile")
  @Auth("user")
  async getProfile(@CurrentUser("id") id: number) {
    return this.userService.byId(id);
  }

  @UsePipes(new ValidationPipe())
  @UseInterceptors(FileFieldsInterceptor([{ name: "picture", maxCount: 1 }]))
  @Auth("user")
  @HttpCode(200)
  @Put("update")
  async updateProfile(@CurrentUser("id") id: number, @Body() dto: UpdateUserDto, @UploadedFiles() files?: any) {
    let picture;
    if (files && files.picture && files.picture.length > 0) {
      picture = files.picture[0];
    }
    return this.userService.updateProfile(id, dto, picture);
  }
}
