import { ObjectType, InputType, Field } from '@nestjs/graphql';
import { Role } from '../common/enums/role.enum';
import { z } from 'zod';

@ObjectType()
export class LoginResponse {
  @Field()
  access_token: string;

  @Field()
  message: string;
}

@ObjectType()
export class RegisterResponse {
  @Field()
  message: string;
}

@ObjectType()
export class CompanyInfo {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class UserInfo {
  @Field()
  id: string;

  @Field()
  username: string;

  @Field()
  email: string;

  @Field()
  role: string;
}

@ObjectType()
export class RegisterOwnerResponse {
  @Field()
  message: string;

  @Field(() => CompanyInfo)
  company: CompanyInfo;

  @Field(() => UserInfo)
  user: UserInfo;
}

@InputType()
export class LoginInput {
  @Field()
  email: string;

  @Field()
  password: string;
}

@InputType()
export class RegisterUserInput {
  @Field()
  username: string;

  @Field()
  email: string;

  @Field()
  password: string;

  @Field()
  role: string;
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

export const loginSchema = z.object({
  email: z.email().trim().toLowerCase(),
  password: z.string().min(6).max(100),
});

export const registerUserSchema = z.object({
  username: z.string().min(3).max(50).trim(),
  email: z.email().trim().toLowerCase(),
  password: z.string().min(6).max(100),
  role: z.enum(Role),
});

export const registerOwnerSchema = z.object({
  companyName: z.string().min(1).max(255).trim(),
  username: z.string().min(3).max(50).trim(),
  email: z.email().trim().toLowerCase(),
  password: z.string().min(6).max(100),
});

export type LoginData = z.infer<typeof loginSchema>;
export type RegisterUserData = z.infer<typeof registerUserSchema>;
export type RegisterOwnerData = z.infer<typeof registerOwnerSchema>;

export type CreateUserData = {
  companyId: string;
  username: string;
  email: string;
  password: string;
  role: Role;
};
