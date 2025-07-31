import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreateInvoiceTable1753193198007 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'invoice',
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
            name: 'order_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'invoice_number',
            type: 'varchar',
            length: '255',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'date',
            type: 'date',
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
      'invoice',
      new TableForeignKey({
        columnNames: ['company_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'company',
        onDelete: 'CASCADE',
        name: 'FK_invoice_company',
      }),
    );

    await queryRunner.createForeignKey(
      'invoice',
      new TableForeignKey({
        columnNames: ['order_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'order',
        onDelete: 'RESTRICT',
        name: 'FK_invoice_order',
      }),
    );

    await queryRunner.createForeignKey(
      'invoice',
      new TableForeignKey({
        columnNames: ['modified_by'],
        referencedColumnNames: ['id'],
        referencedTableName: 'user',
        onDelete: 'RESTRICT',
        name: 'FK_invoice_modified_by',
      }),
    );

    // Create indexes
    await queryRunner.createIndex(
      'invoice',
      new TableIndex({
        name: 'IDX_invoice_number',
        columnNames: ['invoice_number'],
        isUnique: true,
      }),
    );

    await queryRunner.createIndex(
      'invoice',
      new TableIndex({
        name: 'IDX_invoice_company_id',
        columnNames: ['company_id'],
      }),
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('invoice', 'IDX_invoice_company_id');
    await queryRunner.dropIndex('invoice', 'IDX_invoice_number');
    await queryRunner.dropForeignKey('invoice', 'FK_invoice_modified_by');
    await queryRunner.dropForeignKey('invoice', 'FK_invoice_order');
    await queryRunner.dropForeignKey('invoice', 'FK_invoice_company');
    await queryRunner.dropTable('invoice');
  }
}
