import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class Telegram {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
