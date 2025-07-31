import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { WarehouseSupportType } from 'src/common/enums/warehouse-type.enum';

@Entity({ name: 'warehouse' })
export class Warehouse extends BaseEntity {
  @Column({ name: 'company_id', type: 'uuid' })
  companyId!: string;

  @Column({
    name: 'support_type',
    type: 'enum',
    enum: WarehouseSupportType,
  })
  supportType!: WarehouseSupportType;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ name: 'modified_by', type: 'uuid' })
  modifiedBy!: string;
}
