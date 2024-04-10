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

  @Mutation(() => SignResponse, { description: "Authenticate the user and return the user's fields and access and refresh tokens." })
  async login(@Args("loginInput") loginInput: loginInput, @Context("res") res: Response) {
    const { refreshToken, ...response } = await this.authService.login(loginInput);
    this.authService.addRefreshTokenToResponse(res, refreshToken);
    return response;
  }

  @Mutation(() => SignResponse, { description: "Register a new user and return the user's fields and access and refresh tokens" })
  async signUp(@Args("signUpInput") signUpInput: SignUpInput, @Context("res") res: Response) {
    const { refreshToken, ...response } = await this.authService.signUp(signUpInput);
    this.authService.addRefreshTokenToResponse(res, refreshToken);
    return response;
  }

  @Mutation(() => RefreshTokenResponse, { description: "Refresh the access and refresh tokens for a user based on a valid refresh token." })
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

  @Query(() => Boolean, { description: "Log out a user and remove their refresh token cookie." })
  async logout(@Context("res") res: Response) {
    this.authService.removeRefreshTokenFromResponse(res);
    return true;
  }

  @Mutation(() => Boolean, { description: "Send a password reset link to the user's email address." })
  async forgotPassword(@Args("email") email: string) {
    return this.authService.forgotPassword(email);
  }

  @Mutation(() => Boolean, { description: "Reset a user's password using a valid password reset token." })
  async resetPassword(@Args("dto") dto: ResetPasswordInput) {
    await this.authService.resetPassword(dto);
    return true;
  }

  @Query(() => Boolean, { description: "Check if a given activation link is valid and the user's email is activated." })
  async isActivated(@Args("activationLink") activationLink: ActivationLinkInput) {
    return this.authService.isActivated(activationLink);
  }
}
