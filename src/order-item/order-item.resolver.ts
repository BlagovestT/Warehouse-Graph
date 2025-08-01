import {
  Resolver,
  Query,
  Mutation,
  Args,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { OrderItemService } from './order-item.service';
import {
  OrderItemType,
  CreateOrderItemInput,
  UpdateOrderItemInput,
  createOrderItemSchema,
  updateOrderItemSchema,
} from './order-item.type';
import { OrderType } from '../order/order.type';
import { ProductType } from '../product/product.type';
import { UserType } from '../user/user.type';
import { OrderService } from '../order/order.service';
import { ProductService } from '../product/product.service';
import { UserService } from '../user/user.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { RoleGuard } from '../common/guards/role.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { Roles } from '../common/decorators/role.decorator';
import { AnyRole } from '../common/decorators/role.decorator';
import { Role } from '../common/enums/role.enum';
import { UserFromToken } from '../common/guards/jwt.guard';

@Resolver(() => OrderItemType)
export class OrderItemResolver {
  constructor(
    private readonly orderItemService: OrderItemService,
    private readonly orderService: OrderService,
    private readonly productService: ProductService,
    private readonly userService: UserService,
  ) {}

  @Query(() => [OrderItemType])
  @UseGuards(JwtAuthGuard, RoleGuard)
  @AnyRole()
  async orderItems(
    @GetUser() currentUser: UserFromToken,
  ): Promise<OrderItemType[]> {
    return await this.orderItemService.getAllOrderItems(currentUser.companyId);
  }

  @Query(() => OrderItemType)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @AnyRole()
  async orderItem(
    @Args('id') id: string,
    @GetUser() currentUser: UserFromToken,
  ): Promise<OrderItemType> {
    return await this.orderItemService.getOrderItemById(
      id,
      currentUser.companyId,
    );
  }

  @Mutation(() => OrderItemType)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.operator, Role.owner)
  async createOrderItem(
    @Args('input', new ZodValidationPipe(createOrderItemSchema))
    input: CreateOrderItemInput,
    @GetUser() currentUser: UserFromToken,
  ): Promise<OrderItemType> {
    return await this.orderItemService.createOrderItem(
      input,
      currentUser.id,
      currentUser.companyId,
    );
  }

  @Mutation(() => OrderItemType)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.operator, Role.owner)
  async updateOrderItem(
    @Args('id') id: string,
    @Args('input', new ZodValidationPipe(updateOrderItemSchema))
    updateData: UpdateOrderItemInput,
    @GetUser() currentUser: UserFromToken,
  ): Promise<OrderItemType> {
    return await this.orderItemService.updateOrderItem(
      id,
      updateData,
      currentUser.id,
      currentUser.companyId,
    );
  }

  @Mutation(() => String)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.owner)
  async deleteOrderItem(
    @Args('id') id: string,
    @GetUser() currentUser: UserFromToken,
  ): Promise<string> {
    const result = await this.orderItemService.deleteOrderItem(
      id,
      currentUser.companyId,
    );
    return result.message;
  }

  @ResolveField(() => OrderType)
  async order(
    @Parent() orderItem: OrderItemType,
    @GetUser() currentUser: UserFromToken,
  ): Promise<OrderType> {
    return await this.orderService.getOrderById(
      orderItem.orderId,
      currentUser.companyId,
    );
  }

  @ResolveField(() => ProductType)
  async product(
    @Parent() orderItem: OrderItemType,
    @GetUser() currentUser: UserFromToken,
  ): Promise<ProductType> {
    return await this.productService.getProductById(
      orderItem.productId,
      currentUser.companyId,
    );
  }

  @ResolveField(() => UserType)
  async modifiedByUser(
    @Parent() orderItem: OrderItemType,
    @GetUser() currentUser: UserFromToken,
  ): Promise<UserType> {
    return await this.userService.getUserById(
      orderItem.modifiedBy,
      currentUser.companyId,
    );
  }
}
