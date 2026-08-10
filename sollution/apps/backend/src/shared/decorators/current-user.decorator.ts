import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestWithUser } from '@shared/guards/auth.guard';
import { IAuthUser } from '@utils/global.type';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): IAuthUser | undefined => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    return request.authorizedUserDetail;
  },
);
