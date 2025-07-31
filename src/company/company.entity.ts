import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';

@Entity({ name: 'company' })
export class Company extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ name: 'modified_by', type: 'uuid' })
  modifiedBy?: string;
}
