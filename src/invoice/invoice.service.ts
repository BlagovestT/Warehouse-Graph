import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from './invoice.entity';
import { CreateInvoiceData, UpdateInvoiceData } from './invoice.type';
import { BaseService } from '../common/services/base.service';

@Injectable()
export class InvoiceService extends BaseService<Invoice> {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
  ) {
    super(invoiceRepository);
  }

  protected getEntityName(): string {
    return 'Invoice';
  }

  async getAllInvoices(userCompanyId: string): Promise<Invoice[]> {
    return this.getAll(userCompanyId);
  }

  async getInvoiceById(id: string, userCompanyId: string): Promise<Invoice> {
    return this.getById(id, userCompanyId);
  }

  async createInvoice(
    invoiceData: CreateInvoiceData,
    modifiedById: string,
  ): Promise<Invoice> {
    const { invoiceNumber, companyId } = invoiceData;

    const existingInvoice = await this.invoiceRepository.findOne({
      where: { invoiceNumber, companyId },
    });

    if (existingInvoice) {
      throw new ConflictException(
        'Invoice number already exists in your company',
      );
    }

    const invoice = this.invoiceRepository.create({
      ...invoiceData,
      modifiedBy: modifiedById,
    });

    return await this.invoiceRepository.save(invoice);
  }

  async updateInvoice(
    id: string,
    updateData: UpdateInvoiceData,
    modifiedById: string,
    userCompanyId: string,
  ): Promise<Invoice> {
    const invoice = await this.getInvoiceById(id, userCompanyId);

    if (
      updateData.invoiceNumber &&
      updateData.invoiceNumber !== invoice.invoiceNumber
    ) {
      const existingInvoice = await this.invoiceRepository.findOne({
        where: {
          invoiceNumber: updateData.invoiceNumber,
          companyId: invoice.companyId,
        },
      });

      if (existingInvoice) {
        throw new ConflictException(
          'Invoice number already exists in your company',
        );
      }
    }

    await this.invoiceRepository.update(id, {
      ...updateData,
      modifiedBy: modifiedById,
    });

    return await this.getInvoiceById(id, userCompanyId);
  }

  async deleteInvoice(
    id: string,
    userCompanyId: string,
  ): Promise<{ message: string }> {
    return this.deleteById(id, userCompanyId);
  }
}
