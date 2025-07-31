import {
  Resolver,
  Query,
  Mutation,
  Args,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import {
  InvoiceType,
  CreateInvoiceInput,
  UpdateInvoiceInput,
  createInvoiceSchema,
  updateInvoiceSchema,
} from './invoice.type';
import { CompanyType } from '../company/company.type';
import { OrderType } from '../order/order.type';
import { UserType } from '../user/user.type';
import { CompanyService } from '../company/company.service';
import { OrderService } from '../order/order.service';
import { UserService } from '../user/user.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { RoleGuard } from '../common/guards/role.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { Roles } from '../common/decorators/role.decorator';
import { Role } from '../common/enums/role.enum';
import { UserFromToken } from '../common/guards/jwt.guard';

@Resolver(() => InvoiceType)
export class InvoiceResolver {
  constructor(
    private readonly invoiceService: InvoiceService,
    private readonly companyService: CompanyService,
    private readonly orderService: OrderService,
    private readonly userService: UserService,
  ) {}

  @Query(() => [InvoiceType])
  @UseGuards(JwtAuthGuard, RoleGuard)
  async invoices(
    @GetUser() currentUser: UserFromToken,
  ): Promise<InvoiceType[]> {
    return await this.invoiceService.getAllInvoices(currentUser.companyId);
  }

  @Query(() => InvoiceType)
  @UseGuards(JwtAuthGuard, RoleGuard)
  async invoice(
    @Args('id') id: string,
    @GetUser() currentUser: UserFromToken,
  ): Promise<InvoiceType> {
    return await this.invoiceService.getInvoiceById(id, currentUser.companyId);
  }

  @Mutation(() => InvoiceType)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.operator, Role.owner)
  async createInvoice(
    @Args('input', new ZodValidationPipe(createInvoiceSchema))
    input: CreateInvoiceInput,
    @GetUser() currentUser: UserFromToken,
  ): Promise<InvoiceType> {
    const invoiceData = {
      ...input,
      companyId: currentUser.companyId,
    };
    return await this.invoiceService.createInvoice(invoiceData, currentUser.id);
  }

  @Mutation(() => InvoiceType)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.operator, Role.owner)
  async updateInvoice(
    @Args('id') id: string,
    @Args('input', new ZodValidationPipe(updateInvoiceSchema))
    updateData: UpdateInvoiceInput,
    @GetUser() currentUser: UserFromToken,
  ): Promise<InvoiceType> {
    return await this.invoiceService.updateInvoice(
      id,
      updateData,
      currentUser.id,
      currentUser.companyId,
    );
  }

  @Mutation(() => String)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.owner)
  async deleteInvoice(
    @Args('id') id: string,
    @GetUser() currentUser: UserFromToken,
  ): Promise<string> {
    const result = await this.invoiceService.deleteInvoice(
      id,
      currentUser.companyId,
    );
    return result.message;
  }

  @ResolveField(() => CompanyType)
  async company(
    @Parent() invoice: InvoiceType,
    @GetUser() currentUser: UserFromToken,
  ): Promise<CompanyType> {
    return await this.companyService.getCompanyById(
      invoice.companyId,
      currentUser.companyId,
    );
  }

  @ResolveField(() => OrderType)
  async order(@Parent() invoice: InvoiceType): Promise<OrderType> {
    return await this.orderService.getOrderById(
      invoice.orderId,
      invoice.companyId,
    );
  }

  @ResolveField(() => UserType)
  async modifiedByUser(@Parent() invoice: InvoiceType): Promise<UserType> {
    return await this.userService.getUserById(
      invoice.modifiedBy,
      invoice.companyId,
    );
  }
}
