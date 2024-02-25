import { Body, Controller, Get, HttpCode, Param, Post, UsePipes, ValidationPipe } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthLoginDto, AuthSignUpDto } from "./dto/authLoginDto";
import { RefreshTokenDto } from "./dto/refreshToken.dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Post("sign-up")
  async signUp(@Body() dto: AuthSignUpDto) {
    return this.authService.signUp(dto);
  }

  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Post("login")
  async login(@Body() dto: AuthLoginDto) {
    return this.authService.login(dto);
  }

  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Post("login/access-token")
  async getNewTokens(@Body() dto: RefreshTokenDto) {
    return this.authService.getNewTokens(dto.refreshToken);
  }

  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Post("forgot-password")
  async forgotPassword(@Body() email: string) {
    return this.authService.forgotPassword(email);
  }

  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Post("reset-password/:token")
  async resetPassword(@Param("token") token: string, @Body() dto: Partial<AuthLoginDto>) {
    await this.authService.resetPassword(token, dto as AuthLoginDto);
    return { message: "Password has been reset" };
  }

  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Get("/activate/:link")
  async isActivated(@Param() activationLink: string) {
    return this.authService.isActivated(activationLink);
  }
}
