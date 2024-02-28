import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { AuthService } from "./auth.service";
import { ActivationLinkInput, ResetPasswordInput, SignInInput, SignUpInput } from "./dto/auth.input";
import { RefreshTokenInput } from "./dto/refreshToken.input";
import { SignResponse } from "./dto/sign-response";
import { Auth } from "./entities/auth.entity";

@Resolver(of => Auth)
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => SignResponse)
  signUp(@Args("signUpInput") signUpInput: SignUpInput) {
    return this.authService.signUp(signUpInput);
  }

  @Mutation(() => SignResponse)
  signIn(@Args("signInInput") signInInput: SignInInput) {
    return this.authService.signIn(signInInput);
  }

  @Mutation(() => SignResponse)
  async getNewTokens(@Args("dto") dto: RefreshTokenInput): Promise<SignResponse> {
    return this.authService.getNewTokens(dto.refreshToken);
  }

  @Mutation(() => Boolean)
  async forgotPassword(@Args("email") email: string): Promise<boolean> {
    return this.authService.forgotPassword(email);
  }

  @Mutation(() => Boolean)
  async resetPassword(@Args("dto") dto: ResetPasswordInput): Promise<boolean> {
    await this.authService.resetPassword(dto);
    return true;
  }
  @Query(() => Boolean)
  async isActivated(@Args("activationLink") activationLink: ActivationLinkInput): Promise<boolean> {
    return this.authService.isActivated(activationLink);
  }
}
