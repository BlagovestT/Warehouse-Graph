import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { CreateProductData, UpdateProductData } from './product.type';
import { BestSellingProductResult } from 'src/common/interfaces/product.interface';
import { BaseService } from '../common/services/base.service';

@Injectable()
export class ProductService extends BaseService<Product> {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {
    super(productRepository);
  }

  protected getEntityName(): string {
    return 'Product';
  }

  async getAllProducts(userCompanyId: string): Promise<Product[]> {
    return this.getAll(userCompanyId);
  }

  async getProductById(id: string, userCompanyId: string): Promise<Product> {
    return this.getById(id, userCompanyId);
  }

  async createProduct(
    productData: CreateProductData,
    modifiedById: string,
  ): Promise<Product> {
    const { name, companyId } = productData;

    const existingProduct = await this.productRepository.findOne({
      where: { name, companyId },
    });

    if (existingProduct) {
      throw new ConflictException(
        'Product name already exists in your company',
      );
    }

    const product = this.productRepository.create({
      ...productData,
      modifiedBy: modifiedById,
    });

    return await this.productRepository.save(product);
  }

  async updateProduct(
    id: string,
    updateData: UpdateProductData,
    modifiedById: string,
    userCompanyId: string,
  ): Promise<Product> {
    const product = await this.getProductById(id, userCompanyId);

    if (updateData.name && updateData.name !== product.name) {
      const existingProduct = await this.productRepository.findOne({
        where: { name: updateData.name, companyId: product.companyId },
      });

      if (existingProduct) {
        throw new ConflictException(
          'Product name already exists in your company',
        );
      }
    }

    await this.productRepository.update(id, {
      ...updateData,
      modifiedBy: modifiedById,
    });

    return await this.getProductById(id, userCompanyId);
  }

  async deleteProduct(
    id: string,
    userCompanyId: string,
  ): Promise<{ message: string }> {
    return this.deleteById(id, userCompanyId);
  }

  async getBestSellingProducts(
    userCompanyId?: string,
  ): Promise<BestSellingProductResult> {
    const queryBuilder = this.productRepository
      .createQueryBuilder('product')
      .select('product.name', 'productName')
      .addSelect('product.price', 'price')
      .addSelect('company.name', 'companyName')
      .addSelect('SUM(orderItem.quantity)', 'totalSold')
      .innerJoin('order_item', 'orderItem', 'orderItem.product_id = product.id')
      .innerJoin('order', 'order', 'orderItem.order_id = order.id')
      .innerJoin('company', 'company', 'product.company_id = company.id')
      .where('order.type = :type', { type: 'shipment' })
      .andWhere('product.deleted_at IS NULL')
      .andWhere('orderItem.deleted_at IS NULL')
      .andWhere('order.deleted_at IS NULL')
      .andWhere('company.deleted_at IS NULL');

    if (userCompanyId) {
      queryBuilder.andWhere('product.company_id = :companyId', {
        companyId: userCompanyId,
      });
    }

    const result = await queryBuilder
      .groupBy('product.name')
      .addGroupBy('product.price')
      .addGroupBy('company.name')
      .orderBy('"totalSold"', 'DESC')
      .take(1)
      .getRawOne<BestSellingProductResult>();

    if (!result) {
      throw new Error('No best selling product found');
    }

    return result;
  }
}
