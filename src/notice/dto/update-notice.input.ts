import { CreateNoticeInput } from './create-notice.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateNoticeInput extends PartialType(CreateNoticeInput) {
  @Field(() => Int)
  id: number;
}
