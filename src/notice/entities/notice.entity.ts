import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class Notice {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
