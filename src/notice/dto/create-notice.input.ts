import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateNoticeInput {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
