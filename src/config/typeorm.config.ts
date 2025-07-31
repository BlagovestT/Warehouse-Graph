import { DataSource } from 'typeorm';
import { envSchema } from '../env/env';
import { User } from '../user/user.entity';
import { Company } from '../company/company.entity';
import { BusinessPartners } from '../business-partner/business-partner.entity';
import { Warehouse } from '../warehouse/warehouse.entity';
import { Product } from '../product/product.entity';
import { Order } from '../order/order.entity';
import { OrderItem } from '../order-item/order-item.entity';
import { Invoice } from '../invoice/invoice.entity';

const env = envSchema.parse(process.env);

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: env.DB_HOST,
  port: env.DB_PORT,
  username: env.DB_USERNAME,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  synchronize: false,
  logging: env.NODE_ENV === 'development',
  entities: [
    User,
    Company,
    BusinessPartners,
    Warehouse,
    Product,
    Order,
    OrderItem,
    Invoice,
  ],
  migrations: ['src/migrations/*.ts'],
  migrationsTableName: 'migrations',
});
