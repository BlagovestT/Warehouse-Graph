import {
  Resolver,
  Query,
  Mutation,
  Args,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { UserType, UpdateUserInput, updateUserSchema } from './user.type';
import { CompanyType } from '../company/company.type';
import { CompanyService } from '../company/company.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { RoleGuard } from '../common/guards/role.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { Roles } from '../common/decorators/role.decorator';
import { AnyRole } from '../common/decorators/role.decorator';
import { Role } from '../common/enums/role.enum';
import { UserFromToken } from '../common/guards/jwt.guard';

@Resolver(() => UserType)
export class UserResolver {
  constructor(
    private readonly userService: UserService,
    private readonly companyService: CompanyService,
  ) {}

  @Query(() => [UserType])
  @UseGuards(JwtAuthGuard, RoleGuard)
  @AnyRole()
  async users(@GetUser() currentUser: UserFromToken): Promise<UserType[]> {
    return await this.userService.getAllUsers(currentUser.companyId);
  }

  @Query(() => UserType)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @AnyRole()
  async user(
    @Args('id') id: string,
    @GetUser() currentUser: UserFromToken,
  ): Promise<UserType> {
    return await this.userService.getUserById(id, currentUser.companyId);
  }

  @Mutation(() => UserType)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.operator, Role.owner)
  async updateUser(
    @Args('id') id: string,
    @Args('input', new ZodValidationPipe(updateUserSchema))
    updateData: UpdateUserInput,
    @GetUser() currentUser: UserFromToken,
  ): Promise<UserType> {
    return await this.userService.updateUser(
      id,
      updateData,
      currentUser.id,
      currentUser.companyId,
    );
  }

  @Mutation(() => String)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.owner)
  async deleteUser(
    @Args('id') id: string,
    @GetUser() currentUser: UserFromToken,
  ): Promise<string> {
    const result = await this.userService.deleteUser(id, currentUser.companyId);
    return result.message;
  }

  @ResolveField(() => CompanyType)
  async company(@Parent() user: UserType): Promise<CompanyType> {
    return await this.companyService.getCompanyById(
      user.companyId,
      user.companyId,
    );
  }

  @ResolveField(() => UserType, { nullable: true })
  async modifiedByUser(@Parent() user: UserType): Promise<UserType | null> {
    if (!user.modifiedBy) return null;
    return await this.userService.getUserById(user.modifiedBy, user.companyId);
  }
}
