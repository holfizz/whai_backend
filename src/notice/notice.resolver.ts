import { Auth } from "@/auth/decorators/auth.decorator";
import { CurrentUser } from "@/auth/decorators/user.decorator";
import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { CreateNoticeInput } from "./dto/create-notice.input";
import { Notice } from "./entities/notice.entity";
import { NoticeService } from "./notice.service";

@Resolver(() => Notice)
export class NoticeResolver {
  constructor(private readonly noticeService: NoticeService) {}

  @Mutation(() => Notice)
  @Auth("user")
  createNotice(@CurrentUser("id") userId: string, @Args("noticeDto") noticeDto: CreateNoticeInput) {
    return this.noticeService.createNotice(userId, noticeDto);
  }
}
