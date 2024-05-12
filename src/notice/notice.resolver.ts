import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { CreateNoticeInput } from "./dto/create-notice.input";
import { Notice } from "./entities/notice.entity";
import { NoticeService } from "./notice.service";

@Resolver(() => Notice)
export class NoticeResolver {
  constructor(private readonly noticeService: NoticeService) {}

  @Mutation(() => Notice)
  createNotice(@Args("createNoticeInput") createNoticeInput: CreateNoticeInput) {
    // return this.noticeService(createNoticeInput);
  }
}
