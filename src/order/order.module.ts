import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderResolver } from './order.resolver';
import { OrderService } from './order.service';
import { Order } from './order.entity';
import { Invoice } from 'src/invoice/invoice.entity';
import { AuthModule } from 'src/auth/auth.module';
import { CompanyModule } from '../company/company.module';
import { UserModule } from '../user/user.module';
import { BusinessPartnersModule } from '../business-partner/business-partner.module';
import { WarehouseModule } from '../warehouse/warehouse.module';
import { OrderItemModule } from '../order-item/order-item.module';
import { InvoiceModule } from '../invoice/invoice.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, Invoice]),
    forwardRef(() => AuthModule),
    forwardRef(() => CompanyModule),
    forwardRef(() => UserModule),
    forwardRef(() => BusinessPartnersModule),
    forwardRef(() => WarehouseModule),
    forwardRef(() => OrderItemModule),
    forwardRef(() => InvoiceModule),
  ],
  providers: [OrderService, OrderResolver],
  exports: [OrderService],
})
export class OrderModule {}
