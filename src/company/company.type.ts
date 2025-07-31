import { z } from 'zod';
import { ObjectType, Field, InputType } from '@nestjs/graphql';
import { BaseType } from '../common/types/base.type';

export const createCompanySchema = z.object({
  name: z.string().min(1, 'Company name is required').max(255).trim(),
});

export const updateCompanySchema = z.object({
  name: z.string().min(1, 'Company name is required').max(255).trim(),
});

@ObjectType('CompanyGQL')
export class CompanyType extends BaseType {
  @Field()
  name: string;

  @Field({ nullable: true })
  modifiedBy?: string;
}

@InputType()
export class CreateCompanyInput {
  @Field()
  name: string;
}

@InputType()
export class UpdateCompanyInput {
  @Field()
  name: string;
}

export type CreateCompanyData = {
  name: string;
  modifiedBy?: string;
};

export type UpdateCompanyData = {
  name: string;
};
