import { registerEnumType } from '@nestjs/graphql';

export enum OrderTypes {
  SHIPMENT = 'shipment',
  DELIVERY = 'delivery',
}

registerEnumType(OrderTypes, {
  name: 'OrderType',
  description: 'Type of order shipment (outgoing) or delivery (incoming)',
});
