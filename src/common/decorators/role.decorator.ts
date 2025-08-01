import { SetMetadata } from '@nestjs/common';
import { Role } from '../enums/role.enum';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
export const AnyRole = () =>
  SetMetadata(ROLES_KEY, [Role.viewer, Role.operator, Role.owner]);
