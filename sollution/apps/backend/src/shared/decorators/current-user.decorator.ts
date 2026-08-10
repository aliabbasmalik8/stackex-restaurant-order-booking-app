import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestWithUser } from '@shared/guards/auth.guard';
import { IStoredTokenData } from '@utils/global.type';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): IStoredTokenData | undefined => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    return request.authorizedUserDetail;
  },
);
