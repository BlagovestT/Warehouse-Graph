import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order } from './order.entity';
import { Invoice } from '../invoice/invoice.entity';
import { BaseService } from '../common/services/base.service';
import { CreateOrderData, UpdateOrderData } from './order.type';

@Injectable()
export class OrderService extends BaseService<Order> {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
    private readonly dataSource: DataSource,
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

    return await this.dataSource.transaction(async (manager) => {
      const existingOrder = await manager.findOne(Order, {
        where: { orderNumber, companyId },
      });

      if (existingOrder) {
        throw new ConflictException(
          'Order number already exists in your company',
        );
      }

      const order = manager.create(Order, {
        ...orderData,
        modifiedBy: modifiedById,
      });

      const savedOrder = await manager.save(Order, order);

      const invoiceNumber = `INV-${orderNumber}`;

      const existingInvoice = await manager.findOne(Invoice, {
        where: { invoiceNumber, companyId },
      });

      if (existingInvoice) {
        throw new ConflictException(
          `Auto-generated invoice number ${invoiceNumber} already exists`,
        );
      }

      const invoice = manager.create(Invoice, {
        companyId,
        orderId: savedOrder.id,
        invoiceNumber,
        date: new Date(),
        modifiedBy: modifiedById,
      });

      await manager.save(Invoice, invoice);

      return savedOrder;
    });
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
