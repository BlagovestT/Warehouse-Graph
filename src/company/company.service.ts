import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './company.entity';
import { CreateCompanyData, UpdateCompanyData } from './company.type';
import { BaseService } from '../common/services/base.service';

@Injectable()
export class CompanyService extends BaseService<Company> {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
  ) {
    super(companyRepository);
  }

  protected getEntityName(): string {
    return 'Company';
  }

  async getAllCompanies(userCompanyId: string): Promise<Company[]> {
    if (userCompanyId) {
      return await this.companyRepository.find({
        where: { id: userCompanyId },
      });
    }

    return this.getAll();
  }

  async getCompanyById(id: string, userCompanyId: string): Promise<Company> {
    if (userCompanyId && id !== userCompanyId) {
      throw new Error(`Company not found`);
    }

    return this.getById(id, userCompanyId);
  }

  async deleteCompany(
    id: string,
    userCompanyId?: string,
  ): Promise<{ message: string }> {
    if (userCompanyId && id !== userCompanyId) {
      throw new Error(`Company not found`);
    }

    return this.deleteById(id, userCompanyId);
  }

  async createCompany(
    companyData: CreateCompanyData,
    modifiedById: string,
  ): Promise<Company> {
    const { name } = companyData;

    const existingCompany = await this.companyRepository.findOne({
      where: { name },
    });

    if (existingCompany) {
      throw new ConflictException('Company already exists');
    }

    const company = this.companyRepository.create({
      name,
      modifiedBy: modifiedById,
    });

    return await this.companyRepository.save(company);
  }

  async updateCompany(
    id: string,
    updateData: UpdateCompanyData,
    modifiedById: string,
    userCompanyId: string,
  ): Promise<Company> {
    const { name } = updateData;

    const company = await this.getCompanyById(id, userCompanyId);

    if (name !== company.name) {
      const existingCompany = await this.companyRepository.findOne({
        where: { name },
      });

      if (existingCompany) {
        throw new ConflictException('Company name already exists');
      }
    }

    await this.companyRepository.update(id, {
      name,
      modifiedBy: modifiedById,
    });

    return await this.getCompanyById(id, userCompanyId);
  }
}
