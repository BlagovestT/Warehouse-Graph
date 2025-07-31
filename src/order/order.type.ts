import { z } from 'zod';
import { ObjectType, InputType, Field } from '@nestjs/graphql';
import { OrderTypes } from '../common/enums/order-type.enum';
import { Order } from './order.entity';
import { BaseType } from 'src/common/types/base.type';

@ObjectType('OrderGQL')
export class OrderType extends BaseType {
  @Field()
  companyId: string;

  @Field()
  warehouseId: string;

  @Field()
  businessPartnerId: string;

  @Field()
  orderNumber: string;

  @Field(() => OrderTypes)
  type: OrderTypes;

  @Field()
  modifiedBy: string;
}

@InputType()
export class CreateOrderInput {
  @Field()
  warehouseId: string;

  @Field()
  businessPartnerId: string;

  @Field()
  orderNumber: string;

  @Field(() => OrderTypes)
  type: OrderTypes;
}

@InputType()
export class UpdateOrderInput {
  @Field()
  warehouseId: string;

  @Field()
  businessPartnerId: string;

  @Field()
  orderNumber: string;

  @Field(() => OrderTypes)
  type: OrderTypes;
}

export const createOrderSchema = z.object({
  warehouseId: z.uuid(),
  businessPartnerId: z.uuid(),
  orderNumber: z.string().min(1).max(255).trim(),
  type: z.enum(OrderTypes),
});

export const updateOrderSchema = z.object({
  warehouseId: z.uuid().optional(),
  businessPartnerId: z.uuid().optional(),
  orderNumber: z.string().min(1).max(255).trim().optional(),
  type: z.enum(OrderTypes).optional(),
});

export type CreateOrderData = Pick<
  Order,
  'companyId' | 'warehouseId' | 'businessPartnerId' | 'orderNumber' | 'type'
>;
export type UpdateOrderData = Pick<
  Order,
  'warehouseId' | 'businessPartnerId' | 'orderNumber' | 'type'
>;
