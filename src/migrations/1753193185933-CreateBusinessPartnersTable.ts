import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreateBusinessPartnersTable1753193185933
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'business_partners',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'company_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'type',
            type: 'enum',
            enum: ['customer', 'supplier'],
            isNullable: false,
          },
          {
            name: 'modified_by',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'deleted_at',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // Create foreign keys
    await queryRunner.createForeignKey(
      'business_partners',
      new TableForeignKey({
        columnNames: ['company_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'company',
        onDelete: 'CASCADE',
        name: 'FK_business_partners_company',
      }),
    );

    await queryRunner.createForeignKey(
      'business_partners',
      new TableForeignKey({
        columnNames: ['modified_by'],
        referencedColumnNames: ['id'],
        referencedTableName: 'user',
        onDelete: 'RESTRICT',
        name: 'FK_business_partners_modified_by',
      }),
    );

    // Create indexes
    await queryRunner.createIndex(
      'business_partners',
      new TableIndex({
        name: 'IDX_business_partners_company_id',
        columnNames: ['company_id'],
      }),
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex(
      'business_partners',
      'IDX_business_partners_company_id',
    );
    await queryRunner.dropForeignKey(
      'business_partners',
      'FK_business_partners_modified_by',
    );
    await queryRunner.dropForeignKey(
      'business_partners',
      'FK_business_partners_company',
    );
    await queryRunner.dropTable('business_partners');
  }
}
