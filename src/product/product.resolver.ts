import {
  Resolver,
  Query,
  Mutation,
  Args,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ProductService } from './product.service';
import {
  ProductType,
  CreateProductInput,
  UpdateProductInput,
  createProductSchema,
  updateProductSchema,
  BestSellingProductType,
} from './product.type';
import { CompanyType } from '../company/company.type';
import { UserType } from '../user/user.type';
import { OrderItemType } from 'src/order-item/order-item.type';
import { CompanyService } from '../company/company.service';
import { UserService } from '../user/user.service';
import { OrderItemService } from 'src/order-item/order-item.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { RoleGuard } from '../common/guards/role.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { Roles } from '../common/decorators/role.decorator';
import { Role } from '../common/enums/role.enum';
import { UserFromToken } from '../common/guards/jwt.guard';

@Resolver(() => ProductType)
export class ProductResolver {
  constructor(
    private readonly productService: ProductService,
    private readonly companyService: CompanyService,
    private readonly userService: UserService,
    private readonly orderItemService: OrderItemService,
  ) {}

  @Query(() => [ProductType])
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.viewer, Role.operator, Role.owner)
  async products(
    @GetUser() currentUser: UserFromToken,
  ): Promise<ProductType[]> {
    return await this.productService.getAllProducts(currentUser.companyId);
  }

  @Query(() => BestSellingProductType, { nullable: true })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.viewer, Role.operator, Role.owner)
  async bestSellingProduct(
    @GetUser() currentUser: UserFromToken,
  ): Promise<BestSellingProductType | null> {
    try {
      return await this.productService.getBestSellingProducts(
        currentUser.companyId,
      );
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  @Query(() => ProductType)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.viewer, Role.operator, Role.owner)
  async product(
    @Args('id') id: string,
    @GetUser() currentUser: UserFromToken,
  ): Promise<ProductType> {
    return await this.productService.getProductById(id, currentUser.companyId);
  }

  @Mutation(() => ProductType)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.operator, Role.owner)
  async createProduct(
    @Args('input', new ZodValidationPipe(createProductSchema))
    input: CreateProductInput,
    @GetUser() currentUser: UserFromToken,
  ): Promise<ProductType> {
    const productData = {
      ...input,
      companyId: currentUser.companyId,
    };
    return await this.productService.createProduct(productData, currentUser.id);
  }

  @Mutation(() => ProductType)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.operator, Role.owner)
  async updateProduct(
    @Args('id') id: string,
    @Args('input', new ZodValidationPipe(updateProductSchema))
    updateData: UpdateProductInput,
    @GetUser() currentUser: UserFromToken,
  ): Promise<ProductType> {
    return await this.productService.updateProduct(
      id,
      updateData,
      currentUser.id,
      currentUser.companyId,
    );
  }

  @Mutation(() => String)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.owner)
  async deleteProduct(
    @Args('id') id: string,
    @GetUser() currentUser: UserFromToken,
  ): Promise<string> {
    const result = await this.productService.deleteProduct(
      id,
      currentUser.companyId,
    );
    return result.message;
  }

  @ResolveField(() => CompanyType)
  async company(@Parent() product: ProductType): Promise<CompanyType> {
    return await this.companyService.getCompanyById(
      product.companyId,
      product.companyId,
    );
  }

  @ResolveField(() => UserType)
  async modifiedByUser(@Parent() product: ProductType): Promise<UserType> {
    return await this.userService.getUserById(
      product.modifiedBy,
      product.companyId,
    );
  }

  @ResolveField(() => [OrderItemType])
  async orderItems(@Parent() product: ProductType): Promise<OrderItemType[]> {
    const allOrderItems = await this.orderItemService.getAllOrderItems(
      product.companyId,
    );
    return allOrderItems.filter(
      (orderItem) => orderItem.productId === product.id,
    );
  }
}
