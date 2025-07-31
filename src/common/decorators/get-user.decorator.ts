import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Request } from 'express';
import { UserFromToken } from '../guards/jwt.guard';

interface RequestWithUser extends Request {
  user: UserFromToken;
}

export const GetUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UserFromToken => {
    let request: RequestWithUser;

    if (ctx.getType<string>() === 'graphql') {
      const gqlContext = GqlExecutionContext.create(ctx);
      request = gqlContext.getContext<{ req: RequestWithUser }>().req;
    } else {
      request = ctx.switchToHttp().getRequest<RequestWithUser>();
    }

    return request.user;
  },
);
