import {
  Resolver,
  Query,
  Mutation,
  Args,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { WarehouseService } from './warehouse.service';
import {
  WarehouseType,
  CreateWarehouseInput,
  UpdateWarehouseInput,
  createWarehouseSchema,
  updateWarehouseSchema,
  HighestStockType,
} from './warehouse.type';
import { CompanyType } from '../company/company.type';
import { UserType } from '../user/user.type';
import { OrderType } from 'src/order/order.type';
import { CompanyService } from '../company/company.service';
import { UserService } from '../user/user.service';
import { OrderService } from 'src/order/order.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { RoleGuard } from '../common/guards/role.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { Roles } from '../common/decorators/role.decorator';
import { Role } from '../common/enums/role.enum';
import { UserFromToken } from '../common/guards/jwt.guard';

@Resolver(() => WarehouseType)
export class WarehouseResolver {
  constructor(
    private readonly warehouseService: WarehouseService,
    private readonly companyService: CompanyService,
    private readonly userService: UserService,
    private readonly orderService: OrderService,
  ) {}

  @Query(() => [WarehouseType])
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.viewer, Role.operator, Role.owner)
  async warehouses(
    @GetUser() currentUser: UserFromToken,
  ): Promise<WarehouseType[]> {
    return await this.warehouseService.getAllWarehouses(currentUser.companyId);
  }

  @Query(() => HighestStockType, { nullable: true })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.viewer, Role.operator, Role.owner)
  async productWithHighestStock(
    @GetUser() currentUser: UserFromToken,
  ): Promise<HighestStockType | null> {
    try {
      return await this.warehouseService.getProductWithHighestStock(
        currentUser.companyId,
      );
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  @Query(() => WarehouseType)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.viewer, Role.operator, Role.owner)
  async warehouse(
    @Args('id') id: string,
    @GetUser() currentUser: UserFromToken,
  ): Promise<WarehouseType> {
    return await this.warehouseService.getWarehouseById(
      id,
      currentUser.companyId,
    );
  }

  @Mutation(() => WarehouseType)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.operator, Role.owner)
  async createWarehouse(
    @Args('input', new ZodValidationPipe(createWarehouseSchema))
    input: CreateWarehouseInput,
    @GetUser() currentUser: UserFromToken,
  ): Promise<WarehouseType> {
    const warehouseData = {
      ...input,
      companyId: currentUser.companyId,
    };
    return await this.warehouseService.createWarehouse(
      warehouseData,
      currentUser.id,
    );
  }

  @Mutation(() => WarehouseType)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.operator, Role.owner)
  async updateWarehouse(
    @Args('id') id: string,
    @Args('input', new ZodValidationPipe(updateWarehouseSchema))
    updateData: UpdateWarehouseInput,
    @GetUser() currentUser: UserFromToken,
  ): Promise<WarehouseType> {
    return await this.warehouseService.updateWarehouse(
      id,
      updateData,
      currentUser.id,
      currentUser.companyId,
    );
  }

  @Mutation(() => String)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.owner)
  async deleteWarehouse(
    @Args('id') id: string,
    @GetUser() currentUser: UserFromToken,
  ): Promise<string> {
    const result = await this.warehouseService.deleteWarehouse(
      id,
      currentUser.companyId,
    );
    return result.message;
  }

  @ResolveField(() => CompanyType)
  async company(@Parent() warehouse: WarehouseType): Promise<CompanyType> {
    return await this.companyService.getCompanyById(
      warehouse.companyId,
      warehouse.companyId,
    );
  }

  @ResolveField(() => UserType)
  async modifiedByUser(@Parent() warehouse: WarehouseType): Promise<UserType> {
    return await this.userService.getUserById(
      warehouse.modifiedBy,
      warehouse.companyId,
    );
  }

  @ResolveField(() => [OrderType])
  async orders(@Parent() warehouse: WarehouseType): Promise<OrderType[]> {
    const allOrders = await this.orderService.getAllOrders(warehouse.companyId);
    return allOrders.filter((order) => order.warehouseId === warehouse.id);
  }
}
