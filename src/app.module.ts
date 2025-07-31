import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EnvModule } from './env/env.module';
import { envSchema } from './env/env';
import { EnvService } from './env/env.service';
import { getDatabaseConfig } from './config/database.config';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { CompanyModule } from './company/company.module';
import { BusinessPartnersModule } from './business-partner/business-partner.module';
import { WarehouseModule } from './warehouse/warehouse.module';
import { ProductModule } from './product/product.module';
import { OrderModule } from './order/order.module';
import { OrderItemModule } from './order-item/order-item.module';
import { InvoiceModule } from './invoice/invoice.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { EnumsModule } from './common/enums/enum.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: (env) => envSchema.parse(env),
      isGlobal: true,
    }),
    EnvModule,
    TypeOrmModule.forRootAsync({
      imports: [EnvModule],
      useFactory: getDatabaseConfig,
      inject: [EnvService],
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      playground: true,
      autoSchemaFile: './schema.gql',
    }),
    UserModule,
    AuthModule,
    CompanyModule,
    BusinessPartnersModule,
    WarehouseModule,
    ProductModule,
    OrderModule,
    OrderItemModule,
    InvoiceModule,
    EnumsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
