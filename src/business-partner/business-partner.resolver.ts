import {
  Resolver,
  Query,
  Mutation,
  Args,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { BusinessPartnersService } from './business-partner.service';
import {
  BusinessPartnerType,
  CreateBusinessPartnerInput,
  UpdateBusinessPartnerInput,
  createBusinessPartnersSchema,
  updateBusinessPartnersSchema,
  CustomerWithMostOrdersResult,
  CustomerWithMostOrdersType,
} from './business-partner.type';
import { CompanyType } from '../company/company.type';
import { UserType } from '../user/user.type';
import { OrderType } from '../order/order.type';
import { CompanyService } from '../company/company.service';
import { UserService } from '../user/user.service';
import { OrderService } from '../order/order.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { RoleGuard } from '../common/guards/role.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { Roles } from '../common/decorators/role.decorator';
import { AnyRole } from '../common/decorators/role.decorator';
import { Role } from '../common/enums/role.enum';
import { UserFromToken } from '../common/guards/jwt.guard';

@Resolver(() => BusinessPartnerType)
export class BusinessPartnerResolver {
  constructor(
    private readonly businessPartnersService: BusinessPartnersService,
    private readonly companyService: CompanyService,
    private readonly userService: UserService,
    private readonly orderService: OrderService,
  ) {}

  @Query(() => [BusinessPartnerType])
  @UseGuards(JwtAuthGuard, RoleGuard)
  @AnyRole()
  async businessPartners(
    @GetUser() currentUser: UserFromToken,
  ): Promise<BusinessPartnerType[]> {
    return await this.businessPartnersService.getAllBusinessPartners(
      currentUser.companyId,
    );
  }

  @Query(() => CustomerWithMostOrdersType, { nullable: true })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @AnyRole()
  async customerWithMostOrders(
    @GetUser() currentUser: UserFromToken,
  ): Promise<CustomerWithMostOrdersResult | null> {
    return await this.businessPartnersService.getCustomerWithMostOrders(
      currentUser.companyId,
    );
  }

  @Query(() => BusinessPartnerType)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @AnyRole()
  async businessPartner(
    @Args('id') id: string,
    @GetUser() currentUser: UserFromToken,
  ): Promise<BusinessPartnerType> {
    return await this.businessPartnersService.getBusinessPartnerById(
      id,
      currentUser.companyId,
    );
  }

  @Mutation(() => BusinessPartnerType)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.operator, Role.owner)
  async createBusinessPartner(
    @Args('input', new ZodValidationPipe(createBusinessPartnersSchema))
    input: CreateBusinessPartnerInput,
    @GetUser() currentUser: UserFromToken,
  ): Promise<BusinessPartnerType> {
    const businessPartnerData = {
      ...input,
      companyId: currentUser.companyId,
      modifiedBy: currentUser.id,
    };
    return await this.businessPartnersService.createBusinessPartner(
      businessPartnerData,
      currentUser.id,
    );
  }

  @Mutation(() => BusinessPartnerType)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.operator, Role.owner)
  async updateBusinessPartner(
    @Args('id') id: string,
    @Args('input', new ZodValidationPipe(updateBusinessPartnersSchema))
    updateData: UpdateBusinessPartnerInput,
    @GetUser() currentUser: UserFromToken,
  ): Promise<BusinessPartnerType> {
    return await this.businessPartnersService.updateBusinessPartner(
      id,
      updateData,
      currentUser.id,
      currentUser.companyId,
    );
  }

  @Mutation(() => String)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.owner)
  async deleteBusinessPartner(
    @Args('id') id: string,
    @GetUser() currentUser: UserFromToken,
  ): Promise<string> {
    const result = await this.businessPartnersService.deleteBusinessPartner(
      id,
      currentUser.companyId,
    );
    return result.message;
  }

  @ResolveField(() => CompanyType)
  async company(
    @Parent() businessPartner: BusinessPartnerType,
  ): Promise<CompanyType> {
    return await this.companyService.getCompanyById(
      businessPartner.companyId,
      businessPartner.companyId,
    );
  }

  @ResolveField(() => UserType)
  async modifiedByUser(
    @Parent() businessPartner: BusinessPartnerType,
  ): Promise<UserType> {
    return await this.userService.getUserById(
      businessPartner.modifiedBy,
      businessPartner.companyId,
    );
  }

  @ResolveField(() => [OrderType])
  async orders(
    @Parent() businessPartner: BusinessPartnerType,
  ): Promise<OrderType[]> {
    const allOrders = await this.orderService.getAllOrders(
      businessPartner.companyId,
    );
    return allOrders.filter(
      (order) => order.businessPartnerId === businessPartner.id,
    );
  }
}
