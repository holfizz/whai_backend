import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateTelegramInput {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
