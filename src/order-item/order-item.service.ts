import {
  Injectable,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderItem } from './order-item.entity';
import { CreateOrderItemData, UpdateOrderItemData } from './order-item.type';
import { BaseService } from '../common/services/base.service';

@Injectable()
export class OrderItemService extends BaseService<OrderItem> {
  constructor(
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
  ) {
    super(orderItemRepository);
  }

  protected getEntityName(): string {
    return 'OrderItem';
  }

  async getAllOrderItems(userCompanyId: string): Promise<OrderItem[]> {
    if (userCompanyId) {
      return await this.orderItemRepository
        .createQueryBuilder('orderItem')
        .innerJoin('order', 'order', 'orderItem.order_id = order.id')
        .where('order.company_id = :companyId', { companyId: userCompanyId })
        .andWhere('orderItem.deleted_at IS NULL')
        .andWhere('order.deleted_at IS NULL')
        .getMany();
    }
    return this.getAll();
  }

  async getOrderItemById(
    id: string,
    userCompanyId: string,
  ): Promise<OrderItem> {
    const orderItem = await this.orderItemRepository.findOne({
      where: { id },
    });

    if (!orderItem) {
      throw new NotFoundException(`${this.getEntityName()} not found`);
    }

    if (userCompanyId) {
      const order = await this.orderItemRepository.manager
        .createQueryBuilder()
        .select('order.companyId')
        .from('Order', 'order')
        .where('order.id = :orderId', { orderId: orderItem.orderId })
        .andWhere('order.deletedAt IS NULL')
        .getOne();

      if (!order || order.companyId !== userCompanyId) {
        throw new ForbiddenException(
          "Access denied. You can only access your company's order items",
        );
      }
    }

    return orderItem;
  }

  async createOrderItem(
    orderItemData: CreateOrderItemData,
    modifiedById: string,
    userCompanyId: string,
  ): Promise<OrderItem> {
    const { orderId, productId } = orderItemData;

    if (userCompanyId) {
      const order = await this.orderItemRepository.manager.findOne('Order', {
        where: { id: orderId, companyId: userCompanyId },
      });

      if (!order) {
        throw new ForbiddenException(
          'Access denied. Order not found in your company',
        );
      }
    }

    const existingOrderItem = await this.orderItemRepository.findOne({
      where: { orderId, productId },
    });

    if (existingOrderItem) {
      throw new ConflictException(
        'Order item already exists for this product in this order',
      );
    }

    const orderItem = this.orderItemRepository.create({
      ...orderItemData,
      modifiedBy: modifiedById,
    });

    return await this.orderItemRepository.save(orderItem);
  }

  async updateOrderItem(
    id: string,
    updateData: UpdateOrderItemData,
    modifiedById: string,
    userCompanyId: string,
  ): Promise<OrderItem> {
    const orderItem = await this.getOrderItemById(id, userCompanyId);

    if (updateData.productId && updateData.productId !== orderItem.productId) {
      const existingOrderItem = await this.orderItemRepository.findOne({
        where: { orderId: orderItem.orderId, productId: updateData.productId },
      });

      if (existingOrderItem) {
        throw new ConflictException('Product already exists in this order');
      }
    }

    await this.orderItemRepository.update(id, {
      ...updateData,
      modifiedBy: modifiedById,
    });

    return await this.getOrderItemById(id, userCompanyId);
  }

  async deleteOrderItem(
    id: string,
    userCompanyId: string,
  ): Promise<{ message: string }> {
    await this.getOrderItemById(id, userCompanyId);

    await this.orderItemRepository.softDelete(id);
    return { message: `${this.getEntityName()} deleted successfully` };
  }
}
