import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreateUserTable1753193185536 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'user',
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
            name: 'username',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'password',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'role',
            type: 'enum',
            enum: ['owner', 'operator', 'viewer'],
            default: "'viewer'",
            isNullable: false,
          },
          {
            name: 'modified_by',
            type: 'uuid',
            isNullable: true, // Initially nullable for first user creation
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

    // Create foreign key to company
    await queryRunner.createForeignKey(
      'user',
      new TableForeignKey({
        columnNames: ['company_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'company',
        onDelete: 'CASCADE',
        name: 'FK_user_company',
      }),
    );

    // Create self-referencing foreign key for modified_by
    await queryRunner.createForeignKey(
      'user',
      new TableForeignKey({
        columnNames: ['modified_by'],
        referencedColumnNames: ['id'],
        referencedTableName: 'user',
        onDelete: 'SET NULL',
        name: 'FK_user_modified_by',
      }),
    );

    // Create indexes
    await queryRunner.createIndex(
      'user',
      new TableIndex({
        name: 'IDX_user_email',
        columnNames: ['email'],
        isUnique: true,
      }),
    );

    await queryRunner.createIndex(
      'user',
      new TableIndex({
        name: 'IDX_user_company_id',
        columnNames: ['company_id'],
      }),
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('user', 'IDX_user_company_id');
    await queryRunner.dropIndex('user', 'IDX_user_email');
    await queryRunner.dropForeignKey('user', 'FK_user_modified_by');
    await queryRunner.dropForeignKey('user', 'FK_user_company');
    await queryRunner.dropTable('user');
  }
}
