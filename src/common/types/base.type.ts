import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export abstract class BaseType {
  @Field(() => ID)
  id: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field({ nullable: true })
  deletedAt?: Date;
}
