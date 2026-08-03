import { createParamDecorator, type ExecutionContext } from '@nestjs/common';

// ¿Qué? Forma del usuario adjuntada a request.user por JwtStrategy.validate().
export interface AuthenticatedUser {
  id: string;
  email: string;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthenticatedUser => {
    const request = ctx
      .switchToHttp()
      .getRequest<{ user: AuthenticatedUser }>();
    return request.user;
  },
);
