import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessPartners } from './business-partner.entity';
import {
  CreateBusinessPartnersData,
  UpdateBusinessPartnersData,
  CustomerWithMostOrdersResult,
} from './business-partner.type';
import { BaseService } from '../common/services/base.service';

@Injectable()
export class BusinessPartnersService extends BaseService<BusinessPartners> {
  constructor(
    @InjectRepository(BusinessPartners)
    private readonly businessPartnersRepository: Repository<BusinessPartners>,
  ) {
    super(businessPartnersRepository);
  }

  protected getEntityName(): string {
    return 'BusinessPartner';
  }

  // CRUD operations with company isolation
  async getAllBusinessPartners(
    userCompanyId: string,
  ): Promise<BusinessPartners[]> {
    return this.getAll(userCompanyId);
  }

  async getBusinessPartnerById(
    id: string,
    userCompanyId?: string,
  ): Promise<BusinessPartners> {
    return this.getById(id, userCompanyId);
  }

  async createBusinessPartner(
    businessPartnerData: CreateBusinessPartnersData,
    modifiedById: string,
  ): Promise<BusinessPartners> {
    const { email, companyId } = businessPartnerData;

    const existingBusinessPartner =
      await this.businessPartnersRepository.findOne({
        where: { email, companyId },
      });

    if (existingBusinessPartner) {
      throw new ConflictException(
        'Business partner already exists in your company',
      );
    }

    const businessPartner = this.businessPartnersRepository.create({
      ...businessPartnerData,
      modifiedBy: modifiedById,
    });

    return await this.businessPartnersRepository.save(businessPartner);
  }

  async updateBusinessPartner(
    id: string,
    updateData: UpdateBusinessPartnersData,
    modifiedById: string,
    userCompanyId?: string,
  ): Promise<BusinessPartners> {
    const businessPartner = await this.getBusinessPartnerById(
      id,
      userCompanyId,
    );

    if (updateData.email && updateData.email !== businessPartner.email) {
      const existingBusinessPartner =
        await this.businessPartnersRepository.findOne({
          where: {
            email: updateData.email,
            companyId: businessPartner.companyId,
          },
        });

      if (existingBusinessPartner) {
        throw new ConflictException('Email already exists in your company');
      }
    }

    await this.businessPartnersRepository.update(id, {
      ...updateData,
      modifiedBy: modifiedById,
    });

    return await this.getBusinessPartnerById(id, userCompanyId);
  }

  async deleteBusinessPartner(
    id: string,
    userCompanyId?: string,
  ): Promise<{ message: string }> {
    return this.deleteById(id, userCompanyId);
  }

  async getCustomerWithMostOrders(
    userCompanyId?: string,
  ): Promise<CustomerWithMostOrdersResult> {
    const queryBuilder = this.businessPartnersRepository
      .createQueryBuilder('businessPartner')
      .select('businessPartner.name', 'customerName')
      .addSelect('company.name', 'companyName')
      .addSelect('COUNT(order.id)', 'totalOrders')
      .addSelect('SUM(orderItem.quantity)', 'totalItemsBought')
      .innerJoin(
        'order',
        'order',
        'order.business_partner_id = businessPartner.id',
      )
      .innerJoin('order_item', 'orderItem', 'orderItem.order_id = order.id')
      .innerJoin(
        'company',
        'company',
        'businessPartner.company_id = company.id',
      )
      .where('businessPartner.type = :type', { type: 'customer' })
      .andWhere('order.type = :orderType', { orderType: 'shipment' })
      .andWhere('businessPartner.deleted_at IS NULL')
      .andWhere('order.deleted_at IS NULL')
      .andWhere('orderItem.deleted_at IS NULL')
      .andWhere('company.deleted_at IS NULL');

    if (userCompanyId) {
      queryBuilder.andWhere('businessPartner.company_id = :companyId', {
        companyId: userCompanyId,
      });
    }

    const result = await queryBuilder
      .groupBy('businessPartner.name')
      .addGroupBy('company.name')
      .orderBy('"totalOrders"', 'DESC')
      .take(1)
      .getRawOne<CustomerWithMostOrdersResult>();

    if (!result) {
      throw new Error('No customer with orders found');
    }

    return result;
  }
}
