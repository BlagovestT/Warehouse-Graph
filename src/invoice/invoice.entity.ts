import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { dateTransformer } from 'src/common/utils/date.transformer';

@Entity({ name: 'invoice' })
export class Invoice extends BaseEntity {
  @Column({ name: 'company_id', type: 'uuid' })
  companyId!: string;

  @Column({ name: 'order_id', type: 'uuid' })
  orderId!: string;

  @Column({
    name: 'invoice_number',
    type: 'varchar',
    length: 255,
    unique: true,
  })
  invoiceNumber!: string;

  @Column({ type: 'date', transformer: dateTransformer })
  date!: Date;

  @Column({ name: 'modified_by', type: 'uuid' })
  modifiedBy!: string;
}
