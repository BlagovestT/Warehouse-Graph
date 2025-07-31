import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreateOrderItemTable1753193197614 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'order_item',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'order_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'product_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'quantity',
            type: 'int',
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
      'order_item',
      new TableForeignKey({
        columnNames: ['order_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'order',
        onDelete: 'CASCADE',
        name: 'FK_order_item_order',
      }),
    );

    await queryRunner.createForeignKey(
      'order_item',
      new TableForeignKey({
        columnNames: ['product_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'product',
        onDelete: 'RESTRICT',
        name: 'FK_order_item_product',
      }),
    );

    await queryRunner.createForeignKey(
      'order_item',
      new TableForeignKey({
        columnNames: ['modified_by'],
        referencedColumnNames: ['id'],
        referencedTableName: 'user',
        onDelete: 'RESTRICT',
        name: 'FK_order_item_modified_by',
      }),
    );

    // Create indexes
    await queryRunner.createIndex(
      'order_item',
      new TableIndex({
        name: 'IDX_order_item_order_id',
        columnNames: ['order_id'],
      }),
    );

    await queryRunner.createIndex(
      'order_item',
      new TableIndex({
        name: 'IDX_order_item_product_id',
        columnNames: ['product_id'],
      }),
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('order_item', 'IDX_order_item_product_id');
    await queryRunner.dropIndex('order_item', 'IDX_order_item_order_id');
    await queryRunner.dropForeignKey('order_item', 'FK_order_item_modified_by');
    await queryRunner.dropForeignKey('order_item', 'FK_order_item_product');
    await queryRunner.dropForeignKey('order_item', 'FK_order_item_order');
    await queryRunner.dropTable('order_item');
  }
}
