import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { ProductTypes } from 'src/common/enums/product-type.enum';

@Entity({ name: 'product' })
export class Product extends BaseEntity {
  @Column({ name: 'company_id', type: 'uuid' })
  companyId!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price!: number;

  @Column({
    type: 'enum',
    enum: ProductTypes,
  })
  type!: ProductTypes;

  @Column({ name: 'modified_by', type: 'uuid' })
  modifiedBy!: string;
}
