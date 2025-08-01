import {
  Resolver,
  Query,
  Mutation,
  Args,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { OrderService } from './order.service';
import {
  OrderType,
  CreateOrderInput,
  UpdateOrderInput,
  createOrderSchema,
  updateOrderSchema,
} from './order.type';
import { CompanyType } from '../company/company.type';
import { UserType } from '../user/user.type';
import { BusinessPartnerType } from '../business-partner/business-partner.type';
import { WarehouseType } from '../warehouse/warehouse.type';
import { OrderItemType } from '../order-item/order-item.type';
import { InvoiceType } from '../invoice/invoice.type';
import { CompanyService } from '../company/company.service';
import { UserService } from '../user/user.service';
import { BusinessPartnersService } from '../business-partner/business-partner.service';
import { WarehouseService } from '../warehouse/warehouse.service';
import { OrderItemService } from '../order-item/order-item.service';
import { InvoiceService } from '../invoice/invoice.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { RoleGuard } from '../common/guards/role.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { Roles } from '../common/decorators/role.decorator';
import { AnyRole } from '../common/decorators/role.decorator';
import { Role } from '../common/enums/role.enum';
import { UserFromToken } from '../common/guards/jwt.guard';

@Resolver(() => OrderType)
export class OrderResolver {
  constructor(
    private readonly orderService: OrderService,
    private readonly companyService: CompanyService,
    private readonly userService: UserService,
    private readonly businessPartnersService: BusinessPartnersService,
    private readonly warehouseService: WarehouseService,
    private readonly orderItemService: OrderItemService,
    private readonly invoiceService: InvoiceService,
  ) {}

  @Query(() => [OrderType])
  @UseGuards(JwtAuthGuard, RoleGuard)
  @AnyRole()
  async orders(@GetUser() currentUser: UserFromToken): Promise<OrderType[]> {
    return await this.orderService.getAllOrders(currentUser.companyId);
  }

  @Query(() => OrderType)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @AnyRole()
  async order(
    @Args('id') id: string,
    @GetUser() currentUser: UserFromToken,
  ): Promise<OrderType> {
    return await this.orderService.getOrderById(id, currentUser.companyId);
  }

  @Mutation(() => OrderType)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.operator, Role.owner)
  async createOrder(
    @Args('input', new ZodValidationPipe(createOrderSchema))
    input: CreateOrderInput,
    @GetUser() currentUser: UserFromToken,
  ): Promise<OrderType> {
    const orderData = {
      ...input,
      companyId: currentUser.companyId,
    };
    return await this.orderService.createOrder(orderData, currentUser.id);
  }

  @Mutation(() => OrderType)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.operator, Role.owner)
  async updateOrder(
    @Args('id') id: string,
    @Args('input', new ZodValidationPipe(updateOrderSchema))
    updateData: UpdateOrderInput,
    @GetUser() currentUser: UserFromToken,
  ): Promise<OrderType> {
    return await this.orderService.updateOrder(
      id,
      updateData,
      currentUser.id,
      currentUser.companyId,
    );
  }

  @Mutation(() => String)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.owner)
  async deleteOrder(
    @Args('id') id: string,
    @GetUser() currentUser: UserFromToken,
  ): Promise<string> {
    const result = await this.orderService.deleteOrder(
      id,
      currentUser.companyId,
    );
    return result.message;
  }

  @ResolveField(() => CompanyType)
  async company(@Parent() order: OrderType): Promise<CompanyType> {
    return await this.companyService.getCompanyById(
      order.companyId,
      order.companyId,
    );
  }

  @ResolveField(() => UserType)
  async modifiedByUser(@Parent() order: OrderType): Promise<UserType> {
    return await this.userService.getUserById(
      order.modifiedBy,
      order.companyId,
    );
  }

  @ResolveField(() => BusinessPartnerType)
  async businessPartner(
    @Parent() order: OrderType,
  ): Promise<BusinessPartnerType> {
    return await this.businessPartnersService.getBusinessPartnerById(
      order.businessPartnerId,
      order.companyId,
    );
  }

  @ResolveField(() => WarehouseType)
  async warehouse(@Parent() order: OrderType): Promise<WarehouseType> {
    return await this.warehouseService.getWarehouseById(
      order.warehouseId,
      order.companyId,
    );
  }

  @ResolveField(() => [OrderItemType])
  async orderItems(@Parent() order: OrderType): Promise<OrderItemType[]> {
    const allOrderItems = await this.orderItemService.getAllOrderItems(
      order.companyId,
    );
    return allOrderItems.filter((orderItem) => orderItem.orderId === order.id);
  }

  @ResolveField(() => InvoiceType, { nullable: true })
  async invoice(@Parent() order: OrderType): Promise<InvoiceType | null> {
    const allInvoices = await this.invoiceService.getAllInvoices(
      order.companyId,
    );
    const invoice = allInvoices.find((invoice) => invoice.orderId === order.id);
    return invoice || null;
  }
}
