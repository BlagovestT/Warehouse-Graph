import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { BusinessPartnerTypes } from '../common/enums/business-partner.enum';

@Entity({ name: 'business_partners' })
export class BusinessPartners extends BaseEntity {
  @Column({ name: 'company_id', type: 'uuid' })
  companyId!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 255 })
  email!: string;

  @Column({
    type: 'enum',
    enum: BusinessPartnerTypes,
  })
  type!: BusinessPartnerTypes;

  @Column({ name: 'modified_by', type: 'uuid' })
  modifiedBy!: string;
}
