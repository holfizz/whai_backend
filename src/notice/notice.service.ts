import { Injectable } from "@nestjs/common";
import { CreateNoticeInput } from "./dto/create-notice.input";

@Injectable()
export class NoticeService {
  connectToUser(createNoticeInput: CreateNoticeInput) {
    return "This action adds a new notice";
  }
}
