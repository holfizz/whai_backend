import { CreateTelegramInput } from './create-telegram.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateTelegramInput extends PartialType(CreateTelegramInput) {
  @Field(() => Int)
  id: number;
}
