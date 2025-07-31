import { registerEnumType } from '@nestjs/graphql';

export enum ProductTypes {
  SOLID = 'solid',
  LIQUID = 'liquid',
}

registerEnumType(ProductTypes, {
  name: 'ProductType',
  description: 'Physical state of the product',
});
