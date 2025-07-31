import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderItemResolver } from './order-item.resolver';
import { OrderItemService } from './order-item.service';
import { OrderItem } from './order-item.entity';
import { AuthModule } from 'src/auth/auth.module';
import { OrderModule } from '../order/order.module';
import { ProductModule } from '../product/product.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrderItem]),
    forwardRef(() => AuthModule),
    forwardRef(() => OrderModule),
    forwardRef(() => ProductModule),
    forwardRef(() => UserModule),
  ],
  providers: [OrderItemService, OrderItemResolver],
  exports: [OrderItemService],
})
export class OrderItemModule {}
