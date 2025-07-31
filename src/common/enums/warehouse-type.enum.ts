import { registerEnumType } from '@nestjs/graphql';

export enum WarehouseSupportType {
  SOLID = 'solid',
  LIQUID = 'liquid',
  MIXED = 'mixed',
}

registerEnumType(WarehouseSupportType, {
  name: 'WarehouseSupportType',
  description: 'Type of materials the warehouse can support',
});
