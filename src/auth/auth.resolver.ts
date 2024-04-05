import { UnauthorizedException } from "@nestjs/common";
import { Args, Context, Mutation, Query, Resolver } from "@nestjs/graphql";
import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { ActivationLinkInput, ResetPasswordInput, SignUpInput, loginInput } from "./dto/auth.input";
import { RefreshTokenResponse } from "./dto/refreshToken.input";
import { SignResponse } from "./dto/sign-response";

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
    this.authService.addRefreshTokenToResponse(res, refreshToken);

    return response;
  }

  @Mutation(() => RefreshTokenResponse)
  async getNewToken(@Context("req") req: Request, @Context("res") res: Response) {
    const refreshTokenFromCookies = req.cookies[this.authService.REFRESH_TOKEN_NAME];

    if (!refreshTokenFromCookies) {
      this.authService.removeRefreshTokenFromResponse(res);
      throw new UnauthorizedException("Refresh token not passed");
    }

    const { refreshToken, ...response } = await this.authService.getNewTokens(refreshTokenFromCookies);

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
}
