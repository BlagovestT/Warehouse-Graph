import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { OrderTypes } from 'src/common/enums/order-type.enum';

@Entity({ name: 'order' })
export class Order extends BaseEntity {
  @Column({ name: 'company_id', type: 'uuid' })
  companyId!: string;

  @Column({ name: 'warehouse_id', type: 'uuid' })
  warehouseId!: string;

  @Column({ name: 'business_partner_id', type: 'uuid' })
  businessPartnerId!: string;

  @Column({ name: 'order_number', type: 'varchar', length: 255, unique: true })
  orderNumber!: string;

  @Column({
    type: 'enum',
    enum: OrderTypes,
  })
  type!: OrderTypes;

  @Column({ name: 'modified_by', type: 'uuid' })
  modifiedBy!: string;
}
