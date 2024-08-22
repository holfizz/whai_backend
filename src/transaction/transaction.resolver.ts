import { Auth } from "@/auth/decorators/auth.decorator";
import { CurrentUser } from "@/auth/decorators/user.decorator";
import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { MakePaymentDto } from "./dto/make-payment.dto";
import { TinkoffPaymentResponse } from "./response/payment-response";
import { TransactionService } from "./transaction.service";

@Resolver()
export class TransactionResolver {
  constructor(private readonly transactionService: TransactionService) {}

  @Mutation(() => TinkoffPaymentResponse)
  @Auth("user")
  async makePayment(@Args("dto") dto: MakePaymentDto, @CurrentUser("id") userId: string): Promise<TinkoffPaymentResponse> {
    return this.transactionService.makePayment(dto, userId);
  }
}
