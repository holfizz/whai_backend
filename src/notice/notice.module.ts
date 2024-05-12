import { Module } from '@nestjs/common';
import { NoticeService } from './notice.service';
import { NoticeResolver } from './notice.resolver';

@Module({
  providers: [NoticeResolver, NoticeService],
})
export class NoticeModule {}
