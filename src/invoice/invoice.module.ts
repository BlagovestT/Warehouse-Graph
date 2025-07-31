import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvoiceResolver } from './invoice.resolver';
import { InvoiceService } from './invoice.service';
import { Invoice } from './invoice.entity';
import { AuthModule } from 'src/auth/auth.module';
import { OrderModule } from 'src/order/order.module';
import { UserModule } from 'src/user/user.module';
import { CompanyModule } from 'src/company/company.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Invoice]),
    forwardRef(() => AuthModule),
    forwardRef(() => OrderModule),
    forwardRef(() => UserModule),
    forwardRef(() => CompanyModule),
  ],
  providers: [InvoiceService, InvoiceResolver],
  exports: [InvoiceService],
})
export class InvoiceModule {}
