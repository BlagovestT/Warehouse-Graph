import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';
import { CreateUserData, UpdateUserData } from './user.type';
import { BaseService } from '../common/services/base.service';

@Injectable()
export class UserService extends BaseService<User> {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    super(userRepository);
  }

  protected getEntityName(): string {
    return 'User';
  }

  async getAllUsers(userCompanyId: string): Promise<User[]> {
    return this.getAll(userCompanyId);
  }

  async getUserById(id: string, userCompanyId?: string): Promise<User> {
    return this.getById(id, userCompanyId);
  }

  async createUser(userData: CreateUserData): Promise<User> {
    const { email } = userData;

    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

    const user = this.userRepository.create({
      ...userData,
      password: hashedPassword,
    });

    return await this.userRepository.save(user);
  }

  async updateUser(
    id: string,
    updateData: UpdateUserData,
    modifiedById: string,
    userCompanyId: string,
  ): Promise<User> {
    const user = await this.getUserById(id, userCompanyId);

    const dataToUpdate: Partial<User> = {
      ...updateData,
      modifiedBy: modifiedById,
    };

    if (updateData.password) {
      const saltRounds = 10;
      dataToUpdate.password = await bcrypt.hash(
        updateData.password,
        saltRounds,
      );
    }

    if (updateData.email && updateData.email !== user.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: updateData.email },
      });

      if (existingUser) {
        throw new ConflictException('Email already exists');
      }
    }

    await this.userRepository.update(id, dataToUpdate);

    return await this.getUserById(id, userCompanyId);
  }

  async deleteUser(
    id: string,
    userCompanyId: string,
  ): Promise<{ message: string }> {
    return this.deleteById(id, userCompanyId);
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { email },
    });
  }

  async validatePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }
}
