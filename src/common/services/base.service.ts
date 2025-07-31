import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { Repository, FindOptionsWhere } from 'typeorm';

export abstract class BaseService<
  T extends { id: string; companyId?: string },
> {
  protected repository: Repository<T>;

  constructor(repository: Repository<T>) {
    this.repository = repository;
  }

  // Common CRUD operations with optional company isolation

  async getAll(userCompanyId?: string): Promise<T[]> {
    const isCompanyEntity = this.repository.metadata.tableName === 'company';

    if (userCompanyId && !isCompanyEntity) {
      const result = await this.repository.find({
        where: { companyId: userCompanyId } as FindOptionsWhere<T>,
      });
      console.log(result);
      return result;
    }

    const result = await this.repository.find();
    console.log(result);
    return result;
  }

  async getById(id: string, userCompanyId?: string): Promise<T> {
    const entity = await this.repository.findOne({
      where: { id } as FindOptionsWhere<T>,
    });

    if (!entity) {
      throw new NotFoundException(`${this.getEntityName()} not found`);
    }

    const hasCompanyId = this.repository.metadata.columns.some(
      (column) => column.propertyName === 'companyId',
    );

    if (
      userCompanyId &&
      hasCompanyId &&
      'companyId' in entity &&
      entity.companyId !== userCompanyId
    ) {
      throw new ForbiddenException(
        `Access denied. You can only access your company's ${this.getEntityName().toLowerCase()}`,
      );
    }

    return entity;
  }

  async deleteById(
    id: string,
    userCompanyId?: string,
  ): Promise<{ message: string }> {
    await this.getById(id, userCompanyId);

    await this.repository.softDelete(id);
    return { message: `${this.getEntityName()} deleted successfully` };
  }

  protected abstract getEntityName(): string;
}
