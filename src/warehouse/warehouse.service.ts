import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Warehouse } from './warehouse.entity';
import {
  CreateWarehouseData,
  UpdateWarehouseData,
  HighestStockResult,
} from './warehouse.type';
import { BaseService } from '../common/services/base.service';

@Injectable()
export class WarehouseService extends BaseService<Warehouse> {
  constructor(
    @InjectRepository(Warehouse)
    private readonly warehouseRepository: Repository<Warehouse>,
  ) {
    super(warehouseRepository);
  }

  protected getEntityName(): string {
    return 'Warehouse';
  }

  async getAllWarehouses(userCompanyId: string): Promise<Warehouse[]> {
    return this.getAll(userCompanyId);
  }

  async getWarehouseById(
    id: string,
    userCompanyId: string,
  ): Promise<Warehouse> {
    return this.getById(id, userCompanyId);
  }

  async createWarehouse(
    warehouseData: CreateWarehouseData,
    modifiedById: string,
  ): Promise<Warehouse> {
    const { name, companyId } = warehouseData;

    const existingWarehouse = await this.warehouseRepository.findOne({
      where: { name, companyId },
    });

    if (existingWarehouse) {
      throw new ConflictException(
        'Warehouse name already exists in your company',
      );
    }

    const warehouse = this.warehouseRepository.create({
      ...warehouseData,
      modifiedBy: modifiedById,
    });

    return await this.warehouseRepository.save(warehouse);
  }

  async updateWarehouse(
    id: string,
    updateData: UpdateWarehouseData,
    modifiedById: string,
    userCompanyId: string,
  ): Promise<Warehouse> {
    const warehouse = await this.getWarehouseById(id, userCompanyId);

    if (updateData.name && updateData.name !== warehouse.name) {
      const existingWarehouse = await this.warehouseRepository.findOne({
        where: { name: updateData.name, companyId: warehouse.companyId },
      });

      if (existingWarehouse) {
        throw new ConflictException(
          'Warehouse name already exists in your company',
        );
      }
    }

    await this.warehouseRepository.update(id, {
      ...updateData,
      modifiedBy: modifiedById,
    });

    return await this.getWarehouseById(id, userCompanyId);
  }

  async deleteWarehouse(
    id: string,
    userCompanyId: string,
  ): Promise<{ message: string }> {
    return this.deleteById(id, userCompanyId);
  }

  async getProductWithHighestStock(
    userCompanyId: string,
  ): Promise<HighestStockResult> {
    const queryBuilder = this.warehouseRepository
      .createQueryBuilder('warehouse')
      .select('warehouse.name', 'warehouse')
      .addSelect('product.name', 'productName')
      .addSelect(
        `
        SUM(CASE WHEN "order".type = 'delivery' THEN orderItem.quantity ELSE 0 END) -
        SUM(CASE WHEN "order".type = 'shipment' THEN orderItem.quantity ELSE 0 END)
      `,
        'currentStock',
      )
      .innerJoin('order', 'order', 'order.warehouse_id = warehouse.id')
      .innerJoin('order_item', 'orderItem', 'orderItem.order_id = order.id')
      .innerJoin('product', 'product', 'orderItem.product_id = product.id')
      .where('product.deleted_at IS NULL')
      .andWhere('warehouse.deleted_at IS NULL')
      .andWhere('order.deleted_at IS NULL')
      .andWhere('orderItem.deleted_at IS NULL');

    if (userCompanyId) {
      queryBuilder.andWhere('warehouse.company_id = :companyId', {
        companyId: userCompanyId,
      });
    }

    const result = await queryBuilder
      .groupBy('warehouse.name')
      .addGroupBy('product.name')
      .having(
        `
        SUM(CASE WHEN "order".type = 'delivery' THEN orderItem.quantity ELSE 0 END) -
        SUM(CASE WHEN "order".type = 'shipment' THEN orderItem.quantity ELSE 0 END) > 0
      `,
      )
      .orderBy('warehouse.name')
      .addOrderBy('"currentStock"', 'DESC')
      .take(1)
      .getRawOne<HighestStockResult>();

    if (!result) {
      throw new Error('No product with stock found');
    }

    return result;
  }
}
