import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RoleGuard } from '../common/guards/role.guard';
import { Roles } from '../common/decorators/role.decorator';
import { Role } from '../common/enums/role.enum';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { UserFromToken } from '../common/guards/jwt.guard';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import {
  LoginInput,
  RegisterUserInput,
  RegisterOwnerInput,
  LoginResponse,
  RegisterResponse,
  RegisterOwnerResponse,
  loginSchema,
  registerUserSchema,
  registerOwnerSchema,
  LoginData,
  CreateUserData,
  RegisterOwnerData,
} from './auth.type';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => LoginResponse, { name: 'login' })
  async login(
    @Args('input', new ZodValidationPipe(loginSchema)) input: LoginInput,
  ): Promise<LoginResponse> {
    const loginData: LoginData = {
      email: input.email,
      password: input.password,
    };

    return await this.authService.login(loginData);
  }

  @Mutation(() => RegisterResponse)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.owner)
  async registerUser(
    @Args('input', new ZodValidationPipe(registerUserSchema))
    input: RegisterUserInput,
    @GetUser() currentUser: UserFromToken,
  ): Promise<RegisterResponse> {
    const userData: CreateUserData = {
      username: input.username,
      email: input.email,
      password: input.password,
      role: input.role as Role,
      companyId: currentUser.companyId,
    };

    await this.authService.register(userData);

    return {
      message: 'User registered successfully',
    };
  }

  @Mutation(() => RegisterOwnerResponse)
  async registerOwner(
    @Args('input', new ZodValidationPipe(registerOwnerSchema))
    input: RegisterOwnerInput,
  ): Promise<RegisterOwnerResponse> {
    const ownerData: RegisterOwnerData = {
      companyName: input.companyName,
      username: input.username,
      email: input.email,
      password: input.password,
    };

    return await this.authService.registerOwner(ownerData);
  }
}
