import { z } from 'zod';
import { OrderItem } from './order-item.entity';
import { ObjectType, InputType, Field } from '@nestjs/graphql';
import { BaseType } from 'src/common/types/base.type';

@ObjectType('OrderItemGQL')
export class OrderItemType extends BaseType {
  @Field()
  orderId: string;

  @Field()
  productId: string;

  @Field()
  quantity: number;

  @Field()
  modifiedBy: string;
}

@InputType()
export class CreateOrderItemInput {
  @Field()
  orderId: string;

  @Field()
  productId: string;

  @Field()
  quantity: number;
}

@InputType()
export class UpdateOrderItemInput {
  @Field()
  productId: string;

  @Field()
  quantity: number;
}

export const createOrderItemSchema = z.object({
  orderId: z.uuid(),
  productId: z.uuid(),
  quantity: z.number().int().positive(),
});

export const updateOrderItemSchema = z.object({
  productId: z.uuid().optional(),
  quantity: z.number().int().positive().optional(),
});

export type CreateOrderItemData = Pick<
  OrderItem,
  'orderId' | 'productId' | 'quantity'
>;
export type UpdateOrderItemData = Pick<OrderItem, 'productId' | 'quantity'>;
