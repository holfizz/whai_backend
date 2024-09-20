import { UnauthorizedException } from "@nestjs/common";
import { Args, Context, Mutation, Query, Resolver } from "@nestjs/graphql";
import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { Auth } from "./decorators/auth.decorator";
import { CurrentUser } from "./decorators/user.decorator";
import { ActivationLinkInput, ResetPasswordInput, SignUpInput, loginInput } from "./dto/auth.input";
import { RefreshTokenResponse } from "./dto/refreshToken.input";
import { SignResponse } from "./dto/sign-response";
import { TelegramLink } from "./entity/telegram-link.entity";

@Resolver(SignResponse)
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => SignResponse)
  async login(@Args("loginInput") loginInput: loginInput, @Context("res") res: Response) {
    const { refreshToken, ...response } = await this.authService.login(loginInput);
    this.authService.addRefreshTokenToResponse(res, refreshToken);
    return response;
  }

  @Mutation(() => SignResponse)
  async signUp(@Args("signUpInput") signUpInput: SignUpInput, @Context("res") res: Response) {
    const { refreshToken, ...response } = await this.authService.signUp(signUpInput);
    return response;
  }

  @Query(() => RefreshTokenResponse)
  async getNewToken(@Context("req") req: Request, @Context("res") res: Response) {
    const authHeader = req.headers["authorization"];
    const refreshTokenFromHeader = authHeader ? authHeader.split(" ")[1] : null;
    if (!refreshTokenFromHeader) {
      this.authService.removeRefreshTokenFromResponse(res);
      throw new UnauthorizedException("Refresh token not passed");
    }

    const { refreshToken, ...response } = await this.authService.getNewTokens(refreshTokenFromHeader);

    this.authService.addRefreshTokenToResponse(res, refreshToken);

    return response;
  }

  @Query(() => Boolean)
  async logout(@Context("res") res: Response) {
    this.authService.removeRefreshTokenFromResponse(res);
    return true;
  }

  @Mutation(() => Boolean)
  async forgotPassword(@Args("email") email: string) {
    return this.authService.forgotPassword(email);
  }

  @Mutation(() => Boolean)
  async resetPassword(@Args("dto") dto: ResetPasswordInput) {
    await this.authService.resetPassword(dto);
    return true;
  }

  @Query(() => Boolean)
  async isActivated(@Args("activationLink") activationLink: ActivationLinkInput) {
    return this.authService.isActivated(activationLink);
  }

  @Mutation(() => TelegramLink)
  @Auth("user")
  async generateTelegramLink(@CurrentUser("id") userId: string): Promise<TelegramLink> {
    return await this.authService.generateTelegramLink(userId);
  }
}
