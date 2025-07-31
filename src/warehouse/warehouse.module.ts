import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WarehouseResolver } from './warehouse.resolver';
import { WarehouseService } from './warehouse.service';
import { Warehouse } from './warehouse.entity';
import { AuthModule } from 'src/auth/auth.module';
import { CompanyModule } from 'src/company/company.module';
import { UserModule } from 'src/user/user.module';
import { OrderModule } from 'src/order/order.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Warehouse]),
    forwardRef(() => AuthModule),
    forwardRef(() => CompanyModule),
    forwardRef(() => UserModule),
    forwardRef(() => OrderModule),
  ],
  providers: [WarehouseService, WarehouseResolver],
  exports: [WarehouseService],
})
export class WarehouseModule {}
