import { registerEnumType } from '@nestjs/graphql';

export enum BusinessPartnerTypes {
  CUSTOMER = 'customer',
  SUPPLIER = 'supplier',
}

registerEnumType(BusinessPartnerTypes, {
  name: 'BusinessPartnerTypes',
  description: 'Type of business partner - customer or supplier',
});
