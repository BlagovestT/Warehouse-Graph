import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Role } from '../enums/role.enum';
import { UserFromToken } from './jwt.guard';

interface RequestWithUser {
  user?: UserFromToken;
}

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    let request: RequestWithUser;

    if (context.getType<string>() === 'graphql') {
      const gqlContext = GqlExecutionContext.create(context);
      request = gqlContext.getContext<{ req: RequestWithUser }>().req;
    } else {
      request = context.switchToHttp().getRequest<RequestWithUser>();
    }

    if (!request || !request.user) {
      return false;
    }

    const user = request.user;
    return requiredRoles.some((role) => user.role === role);
  }
}
