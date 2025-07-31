import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
import { UserService } from '../user/user.service';
import { CompanyService } from '../company/company.service';
import { LoginData, CreateUserData } from '../user/user.type';
import { User } from '../user/user.entity';
import { Company } from '../company/company.entity';
import { Role } from '../common/enums/role.enum';
import {
  JwtPayload,
  RegisterOwnerData,
} from 'src/common/interfaces/auth.interface';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private companyService: CompanyService,
    private jwtService: JwtService,
    private dataSource: DataSource,
  ) {}

  async login(loginData: LoginData) {
    const { email, password } = loginData;

    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.userService.validatePassword(
      password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
    };

    return {
      access_token: this.jwtService.sign(payload),
      message: 'User logged successfully',
    };
  }

  async register(userData: CreateUserData) {
    await this.userService.createUser(userData);

    return {
      message: 'User registered successfully',
    };
  }

  async verifyToken(token: string) {
    try {
      const payload = this.jwtService.verify<JwtPayload>(token);
      const user = await this.userService.getUserById(payload.sub);
      return user;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async registerOwner(ownerData: RegisterOwnerData) {
    const { companyName, username, email, password } = ownerData;

    return await this.dataSource.transaction(async (manager) => {
      const company = manager.create(Company, {
        name: companyName,
      });
      const savedCompany = await manager.save(Company, company);

      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const user = manager.create(User, {
        companyId: savedCompany.id,
        username,
        email,
        password: hashedPassword,
        role: Role.owner,
      });
      const savedUser = await manager.save(User, user);

      await manager.update(Company, savedCompany.id, {
        modifiedBy: savedUser.id,
      });

      return {
        message: 'Company and owner registered successfully',
        company: savedCompany,
        user: {
          id: savedUser.id,
          username: savedUser.username,
          email: savedUser.email,
          role: savedUser.role,
        },
      };
    });
  }
}
