import { z } from 'zod';
import { Invoice } from './invoice.entity';
import { ObjectType, InputType, Field } from '@nestjs/graphql';
import { BaseType } from 'src/common/types/base.type';

@ObjectType('InvoiceGQL')
export class InvoiceType extends BaseType {
  @Field()
  companyId: string;

  @Field()
  orderId: string;

  @Field()
  invoiceNumber: string;

  @Field()
  date: Date;

  @Field()
  modifiedBy: string;
}

@InputType()
export class CreateInvoiceInput {
  @Field()
  companyId: string;

  @Field()
  orderId: string;

  @Field()
  invoiceNumber: string;

  @Field()
  date: Date;
}

@InputType()
export class UpdateInvoiceInput {
  @Field()
  orderId: string;

  @Field()
  invoiceNumber: string;

  @Field()
  date: Date;
}

export type CreateInvoiceData = Pick<
  Invoice,
  'companyId' | 'orderId' | 'invoiceNumber' | 'date'
>;
export type UpdateInvoiceData = Pick<
  Invoice,
  'orderId' | 'invoiceNumber' | 'date'
>;

export const createInvoiceSchema = z.object({
  companyId: z.uuid(),
  orderId: z.uuid(),
  invoiceNumber: z.string().min(1).max(255).trim(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
});

export const updateInvoiceSchema = z.object({
  orderId: z.uuid().optional(),
  invoiceNumber: z.string().min(1).max(255).trim().optional(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .optional(),
});
