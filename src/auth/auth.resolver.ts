import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { AuthService } from "./auth.service";
import { SignInInput, SignUpInput } from "./dto/auth.input";
import { SignResponse } from "./dto/sign-response";

@Resolver()
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
}
