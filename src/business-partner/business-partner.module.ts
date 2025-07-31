import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusinessPartnerResolver } from './business-partner.resolver';
import { BusinessPartnersService } from './business-partner.service';
import { BusinessPartners } from './business-partner.entity';
import { AuthModule } from '../auth/auth.module';
import { OrderModule } from 'src/order/order.module';
import { UserModule } from 'src/user/user.module';
import { CompanyModule } from 'src/company/company.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([BusinessPartners]),
    forwardRef(() => AuthModule),
    forwardRef(() => CompanyModule),
    forwardRef(() => UserModule),
    forwardRef(() => OrderModule),
  ],
  providers: [BusinessPartnersService, BusinessPartnerResolver],
  exports: [BusinessPartnersService],
})
export class BusinessPartnersModule {}
