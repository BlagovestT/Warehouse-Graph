import { z } from 'zod';
import { ObjectType, Field, InputType } from '@nestjs/graphql';
import { BaseType } from '../common/types/base.type';
import { BusinessPartnerTypes } from '../common/enums/business-partner.enum';
import { BusinessPartners } from './business-partner.entity';

@ObjectType()
export class BusinessPartnerType extends BaseType {
  @Field()
  companyId: string;

  @Field()
  name: string;

  @Field()
  email: string;

  @Field(() => BusinessPartnerTypes)
  type: BusinessPartnerTypes;

  @Field()
  modifiedBy: string;
}

@ObjectType()
export class CustomerWithMostOrdersType {
  @Field()
  customerName: string;

  @Field()
  companyName: string;

  @Field()
  totalOrders: string;

  @Field()
  totalItemsBought: string;
}

@InputType()
export class CreateBusinessPartnerInput {
  @Field(() => BusinessPartnerTypes)
  type: BusinessPartnerTypes;

  @Field()
  name: string;

  @Field()
  email: string;
}

@InputType()
export class UpdateBusinessPartnerInput {
  @Field(() => BusinessPartnerTypes)
  type: BusinessPartnerTypes;

  @Field()
  name: string;

  @Field()
  email: string;
}

export const createBusinessPartnersSchema = z.object({
  companyId: z.uuid(),
  name: z.string().min(2).max(255).trim(),
  email: z.email(),
  type: z.enum(BusinessPartnerTypes),
});

export const updateBusinessPartnersSchema = z.object({
  name: z.string().min(2).max(255).trim().optional(),
  email: z.email().optional(),
  type: z.enum(BusinessPartnerTypes).optional(),
});

export type CreateBusinessPartnersData = Pick<
  BusinessPartners,
  'companyId' | 'name' | 'email' | 'type' | 'modifiedBy'
>;
export type UpdateBusinessPartnersData = Pick<
  BusinessPartners,
  'name' | 'email' | 'type'
>;

export type CustomerWithMostOrdersResult = {
  customerName: string;
  companyName: string;
  totalOrders: string;
  totalItemsBought: string;
};
