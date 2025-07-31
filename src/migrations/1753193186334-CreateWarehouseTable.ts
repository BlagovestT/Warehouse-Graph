import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreateWarehouseTable1753193186334 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'warehouse',
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
            name: 'support_type',
            type: 'enum',
            enum: ['solid', 'liquid', 'mixed'],
            isNullable: false,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
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
      'warehouse',
      new TableForeignKey({
        columnNames: ['company_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'company',
        onDelete: 'CASCADE',
        name: 'FK_warehouse_company',
      }),
    );

    await queryRunner.createForeignKey(
      'warehouse',
      new TableForeignKey({
        columnNames: ['modified_by'],
        referencedColumnNames: ['id'],
        referencedTableName: 'user',
        onDelete: 'RESTRICT',
        name: 'FK_warehouse_modified_by',
      }),
    );

    // Create indexes
    await queryRunner.createIndex(
      'warehouse',
      new TableIndex({
        name: 'IDX_warehouse_company_id',
        columnNames: ['company_id'],
      }),
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('warehouse', 'IDX_warehouse_company_id');
    await queryRunner.dropForeignKey('warehouse', 'FK_warehouse_modified_by');
    await queryRunner.dropForeignKey('warehouse', 'FK_warehouse_company');
    await queryRunner.dropTable('warehouse');
  }
}
