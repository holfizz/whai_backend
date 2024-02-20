import { Controller, Get } from '@nestjs/common';
import { UserService } from './user.service';
import { Auth } from '../auth/decorators/auth.decorator';
import { CurrentUser } from '../auth/decorators/user.decorator';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  @Auth('user')
  async getProfile(@CurrentUser('id') id: number) {
    return this.userService.byId(id);
  }

  // @UsePipes(new ValidationPipe())
  // @Auth('user')
  // @HttpCode(200)
  // @Put('update')
  // async updateProfile(@CurrentUser('id') id: number, @Body() dto: UserDto) {
  //   return this.userService.updateProfile(id, dto);
  // }
}
