import { z } from 'zod';
import { WarehouseSupportType } from '../common/enums/warehouse-type.enum';
import { ObjectType, InputType, Field } from '@nestjs/graphql';
import { BaseType } from '../common/types/base.type';

@ObjectType()
export class WarehouseType extends BaseType {
  @Field()
  companyId: string;

  @Field(() => WarehouseSupportType)
  supportType: WarehouseSupportType;

  @Field()
  name: string;

  @Field()
  modifiedBy: string;
}

@InputType()
export class CreateWarehouseInput {
  @Field(() => WarehouseSupportType)
  supportType: WarehouseSupportType;

  @Field()
  name: string;
}

@InputType()
export class UpdateWarehouseInput {
  @Field(() => WarehouseSupportType, { nullable: true })
  supportType?: WarehouseSupportType;

  @Field({ nullable: true })
  name?: string;
}

@ObjectType()
export class HighestStockType {
  @Field()
  warehouse: string;

  @Field()
  productName: string;

  @Field()
  currentStock: string;
}

// Zod schemas
export const createWarehouseSchema = z.object({
  supportType: z.enum(WarehouseSupportType),
  name: z.string().min(2).max(255).trim(),
});

export const updateWarehouseSchema = z.object({
  supportType: z.enum(WarehouseSupportType).optional(),
  name: z.string().min(2).max(255).trim().optional(),
});

// TypeScript types for service layer
export type CreateWarehouseData = {
  companyId: string;
  supportType: WarehouseSupportType;
  name: string;
};

export type UpdateWarehouseData = {
  supportType?: WarehouseSupportType;
  name?: string;
};

export type HighestStockResult = {
  warehouse: string;
  productName: string;
  currentStock: string;
};
