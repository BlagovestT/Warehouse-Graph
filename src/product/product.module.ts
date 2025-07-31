import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductResolver } from './product.resolver';
import { ProductService } from './product.service';
import { Product } from './product.entity';
import { AuthModule } from 'src/auth/auth.module';
import { CompanyModule } from 'src/company/company.module';
import { UserModule } from 'src/user/user.module';
import { OrderItemModule } from 'src/order-item/order-item.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product]),
    forwardRef(() => AuthModule),
    forwardRef(() => CompanyModule),
    forwardRef(() => UserModule),
    forwardRef(() => OrderItemModule),
  ],
  providers: [ProductService, ProductResolver],
  exports: [ProductService],
})
export class ProductModule {}
