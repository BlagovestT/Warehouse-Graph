import {
  Resolver,
  Query,
  Mutation,
  Args,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CompanyService } from './company.service';
import {
  CompanyType,
  CreateCompanyInput,
  UpdateCompanyInput,
  createCompanySchema,
  updateCompanySchema,
} from './company.type';
import { UserType } from '../user/user.type';
import { BusinessPartnerType } from '../business-partner/business-partner.type';
import { WarehouseType } from '../warehouse/warehouse.type';
import { ProductType } from '../product/product.type';
import { OrderType } from '../order/order.type';
import { InvoiceType } from '../invoice/invoice.type';
import { UserService } from '../user/user.service';
import { BusinessPartnersService } from '../business-partner/business-partner.service';
import { WarehouseService } from '../warehouse/warehouse.service';
import { ProductService } from '../product/product.service';
import { OrderService } from '../order/order.service';
import { InvoiceService } from '../invoice/invoice.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { RoleGuard } from '../common/guards/role.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { Roles } from '../common/decorators/role.decorator';
import { Role } from '../common/enums/role.enum';
import { UserFromToken } from '../common/guards/jwt.guard';

@Resolver(() => CompanyType)
export class CompanyResolver {
  constructor(
    private readonly companyService: CompanyService,
    private readonly userService: UserService,
    private readonly businessPartnersService: BusinessPartnersService,
    private readonly warehouseService: WarehouseService,
    private readonly productService: ProductService,
    private readonly orderService: OrderService,
    private readonly invoiceService: InvoiceService,
  ) {}

  @Query(() => [CompanyType])
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.viewer, Role.operator, Role.owner)
  async companies(
    @GetUser() currentUser: UserFromToken,
  ): Promise<CompanyType[]> {
    return await this.companyService.getAllCompanies(currentUser.companyId);
  }

  @Query(() => CompanyType)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.viewer, Role.operator, Role.owner)
  async company(
    @Args('id') id: string,
    @GetUser() currentUser: UserFromToken,
  ): Promise<CompanyType> {
    return await this.companyService.getCompanyById(id, currentUser.companyId);
  }

  @Mutation(() => CompanyType)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.operator, Role.owner)
  async createCompany(
    @Args('input', new ZodValidationPipe(createCompanySchema))
    input: CreateCompanyInput,
    @GetUser() currentUser: UserFromToken,
  ): Promise<CompanyType> {
    return await this.companyService.createCompany(input, currentUser.id);
  }

  @Mutation(() => CompanyType)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.operator, Role.owner)
  async updateCompany(
    @Args('id') id: string,
    @Args('input', new ZodValidationPipe(updateCompanySchema))
    updateData: UpdateCompanyInput,
    @GetUser() currentUser: UserFromToken,
  ): Promise<CompanyType> {
    return await this.companyService.updateCompany(
      id,
      updateData,
      currentUser.id,
      currentUser.companyId,
    );
  }

  @Mutation(() => String)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.owner)
  async deleteCompany(
    @Args('id') id: string,
    @GetUser() currentUser: UserFromToken,
  ): Promise<string> {
    const result = await this.companyService.deleteCompany(
      id,
      currentUser.companyId,
    );
    return result.message;
  }

  @ResolveField(() => [UserType])
  async users(@Parent() company: CompanyType): Promise<UserType[]> {
    return await this.userService.getAllUsers(company.id);
  }

  @ResolveField(() => [BusinessPartnerType])
  async businessPartners(
    @Parent() company: CompanyType,
  ): Promise<BusinessPartnerType[]> {
    return await this.businessPartnersService.getAllBusinessPartners(
      company.id,
    );
  }

  @ResolveField(() => [WarehouseType])
  async warehouses(@Parent() company: CompanyType): Promise<WarehouseType[]> {
    return await this.warehouseService.getAllWarehouses(company.id);
  }

  @ResolveField(() => [ProductType])
  async products(@Parent() company: CompanyType): Promise<ProductType[]> {
    return await this.productService.getAllProducts(company.id);
  }

  @ResolveField(() => [OrderType])
  async orders(@Parent() company: CompanyType): Promise<OrderType[]> {
    return await this.orderService.getAllOrders(company.id);
  }

  @ResolveField(() => [InvoiceType])
  async invoices(@Parent() company: CompanyType): Promise<InvoiceType[]> {
    return await this.invoiceService.getAllInvoices(company.id);
  }

  @ResolveField(() => UserType, { nullable: true })
  async modifiedByUser(
    @Parent() company: CompanyType,
  ): Promise<UserType | null> {
    if (!company.modifiedBy) return null;
    return await this.userService.getUserById(company.modifiedBy, company.id);
  }
}
