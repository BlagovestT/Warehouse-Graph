import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './order.entity';
import { BaseService } from '../common/services/base.service';
import { CreateOrderData, UpdateOrderData } from './order.type';

@Injectable()
export class OrderService extends BaseService<Order> {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {
    super(orderRepository);
  }

  protected getEntityName(): string {
    return 'Order';
  }

  async getAllOrders(userCompanyId: string): Promise<Order[]> {
    return this.getAll(userCompanyId);
  }

  async getOrderById(id: string, userCompanyId: string): Promise<Order> {
    return this.getById(id, userCompanyId);
  }

  async createOrder(
    orderData: CreateOrderData,
    modifiedById: string,
  ): Promise<Order> {
    const { orderNumber, companyId } = orderData;

    const existingOrder = await this.orderRepository.findOne({
      where: { orderNumber, companyId },
    });

    if (existingOrder) {
      throw new ConflictException(
        'Order number already exists in your company',
      );
    }

    const order = this.orderRepository.create({
      ...orderData,
      modifiedBy: modifiedById,
    });

    return await this.orderRepository.save(order);
  }

  async updateOrder(
    id: string,
    updateData: UpdateOrderData,
    modifiedById: string,
    userCompanyId: string,
  ): Promise<Order> {
    const order = await this.getOrderById(id, userCompanyId);

    if (
      updateData.orderNumber &&
      updateData.orderNumber !== order.orderNumber
    ) {
      const existingOrder = await this.orderRepository.findOne({
        where: {
          orderNumber: updateData.orderNumber,
          companyId: order.companyId,
        },
      });

      if (existingOrder) {
        throw new ConflictException(
          'Order number already exists in your company',
        );
      }
    }

    await this.orderRepository.update(id, {
      ...updateData,
      modifiedBy: modifiedById,
    });

    return await this.getOrderById(id, userCompanyId);
  }

  async deleteOrder(
    id: string,
    userCompanyId?: string,
  ): Promise<{ message: string }> {
    return this.deleteById(id, userCompanyId);
  }
}
