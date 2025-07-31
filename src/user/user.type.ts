import { z } from 'zod';
import { ObjectType, Field, InputType } from '@nestjs/graphql';
import { Role } from '../common/enums/role.enum';
import { BaseType } from '../common/types/base.type';

export const registerOwnerSchema = z.object({
  companyName: z.string().min(1).max(255).trim(),
  username: z.string().min(3).max(50).trim(),
  email: z.email(),
  password: z.string().min(6),
});

export const registerUserSchema = z.object({
  username: z.string().min(3).max(50).trim(),
  email: z.email(),
  password: z.string().min(6),
  role: z.enum(Role),
});

export const updateUserSchema = z.object({
  username: z.string().min(3).max(50).trim().optional(),
  email: z.email().optional(),
  password: z.string().min(6).optional(),
  role: z.enum(Role).optional(),
});

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

@ObjectType()
export class UserType extends BaseType {
  @Field()
  companyId: string;

  @Field()
  username: string;

  @Field()
  email: string;

  @Field(() => Role)
  role: Role;

  @Field({ nullable: true })
  modifiedBy?: string;
}

@InputType()
export class RegisterUserInput {
  @Field()
  username: string;

  @Field()
  email: string;

  @Field()
  password: string;

  @Field(() => Role)
  role: Role;
}

@InputType()
export class UpdateUserInput {
  @Field({ nullable: true })
  username?: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  password?: string;

  @Field(() => Role, { nullable: true })
  role?: Role;
}

@InputType()
export class LoginInput {
  @Field()
  email: string;

  @Field()
  password: string;
}

@InputType()
export class RegisterOwnerInput {
  @Field()
  companyName: string;

  @Field()
  username: string;

  @Field()
  email: string;

  @Field()
  password: string;
}

export type CreateUserData = {
  companyId: string;
  username: string;
  email: string;
  password: string;
  role: Role;
};

export type UpdateUserData = Partial<{
  username: string;
  email: string;
  password: string;
  role: Role;
}>;

export type LoginData = {
  email: string;
  password: string;
};
