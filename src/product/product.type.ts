import { z } from 'zod';
import { ProductTypes } from 'src/common/enums/product-type.enum';
import { InputType, ObjectType, Field } from '@nestjs/graphql';
import { Product } from './product.entity';
import { BaseType } from 'src/common/types/base.type';

@ObjectType('ProductGQL')
export class ProductType extends BaseType {
  @Field()
  companyId: string;

  @Field()
  name: string;

  @Field()
  price: number;

  @Field(() => ProductTypes)
  type: ProductTypes;

  @Field()
  modifiedBy: string;
}

@ObjectType()
export class BestSellingProductType {
  @Field()
  productName: string;

  @Field()
  price: string;

  @Field()
  companyName: string;

  @Field()
  totalSold: string;
}

@InputType()
export class CreateProductInput {
  @Field()
  name: string;

  @Field()
  price: number;

  @Field(() => ProductTypes)
  type: ProductTypes;
}

@InputType()
export class UpdateProductInput {
  @Field()
  name: string;

  @Field()
  price: number;

  @Field(() => ProductTypes)
  type: ProductTypes;
}

export const createProductSchema = z.object({
  name: z.string().min(2).max(255).trim(),
  price: z.number().positive(),
  type: z.enum(ProductTypes),
});

export const updateProductSchema = z.object({
  name: z.string().min(2).max(255).trim().optional(),
  price: z.number().positive().optional(),
  type: z.enum(ProductTypes).optional(),
});

export type CreateProductData = Pick<
  Product,
  'companyId' | 'name' | 'price' | 'type'
>;
export type UpdateProductData = Pick<Product, 'name' | 'price' | 'type'>;

export type BestSellingProductResult = {
  productName: string;
  price: string;
  companyName: string;
  totalSold: string;
};
