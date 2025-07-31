import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { Role } from '../common/enums/role.enum';

@Entity({ name: 'user' })
export class User extends BaseEntity {
  @Column({ name: 'company_id', type: 'uuid' })
  companyId!: string;

  @Column({ type: 'varchar', length: 255 })
  username!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 255 })
  password!: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.viewer,
  })
  role!: Role;

  @Column({ name: 'modified_by', type: 'uuid', nullable: true })
  modifiedBy?: string;
}
