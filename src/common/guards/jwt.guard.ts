import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Request } from 'express';
import { Role } from '../enums/role.enum';

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  companyId: string;
  iat: number;
  exp: number;
}

export interface UserFromToken {
  id: string;
  email: string;
  role: Role;
  companyId: string;
}

interface RequestWithUser extends Request {
  user?: UserFromToken;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    let request: RequestWithUser;

    if (context.getType<string>() === 'graphql') {
      const gqlContext = GqlExecutionContext.create(context);
      request = gqlContext.getContext<{ req: RequestWithUser }>().req;
    } else {
      request = context.switchToHttp().getRequest<RequestWithUser>();
    }

    if (!request || !request.headers) {
      throw new UnauthorizedException('No request context available');
    }

    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('No token provided');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('Invalid token format');
    }

    try {
      const payload = this.jwtService.verify<JwtPayload>(token);

      request.user = {
        id: payload.sub,
        email: payload.email,
        role: payload.role as Role,
        companyId: payload.companyId,
      };

      return true;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
