import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreateOrderTable1753193187112 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'order',
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
            name: 'warehouse_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'business_partner_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'order_number',
            type: 'varchar',
            length: '255',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'type',
            type: 'enum',
            enum: ['shipment', 'delivery'],
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
      'order',
      new TableForeignKey({
        columnNames: ['company_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'company',
        onDelete: 'CASCADE',
        name: 'FK_order_company',
      }),
    );

    await queryRunner.createForeignKey(
      'order',
      new TableForeignKey({
        columnNames: ['warehouse_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'warehouse',
        onDelete: 'RESTRICT',
        name: 'FK_order_warehouse',
      }),
    );

    await queryRunner.createForeignKey(
      'order',
      new TableForeignKey({
        columnNames: ['business_partner_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'business_partners',
        onDelete: 'RESTRICT',
        name: 'FK_order_business_partner',
      }),
    );

    await queryRunner.createForeignKey(
      'order',
      new TableForeignKey({
        columnNames: ['modified_by'],
        referencedColumnNames: ['id'],
        referencedTableName: 'user',
        onDelete: 'RESTRICT',
        name: 'FK_order_modified_by',
      }),
    );

    // Create indexes
    await queryRunner.createIndex(
      'order',
      new TableIndex({
        name: 'IDX_order_number',
        columnNames: ['order_number'],
        isUnique: true,
      }),
    );

    await queryRunner.createIndex(
      'order',
      new TableIndex({
        name: 'IDX_order_company_id',
        columnNames: ['company_id'],
      }),
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('order', 'IDX_order_company_id');
    await queryRunner.dropIndex('order', 'IDX_order_number');
    await queryRunner.dropForeignKey('order', 'FK_order_modified_by');
    await queryRunner.dropForeignKey('order', 'FK_order_business_partner');
    await queryRunner.dropForeignKey('order', 'FK_order_warehouse');
    await queryRunner.dropForeignKey('order', 'FK_order_company');
    await queryRunner.dropTable('order');
  }
}
