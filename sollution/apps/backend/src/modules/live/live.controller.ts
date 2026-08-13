import { Controller, Sse, UseGuards, type MessageEvent } from '@nestjs/common';
import { CurrentUser } from '@shared/decorators/current-user.decorator';
import { AuthGuard } from '@shared/guards/auth.guard';
import { SuperAdminGuard } from '@shared/guards/super-admin.guard';
import { IAuthUser } from '@utils/global.type';
import { Observable } from 'rxjs';
import { LiveService } from './live.service';

@Controller('live')
@UseGuards(AuthGuard)
export class LiveController {
  constructor(private readonly live: LiveService) {}

  /** All catalog events marked `admin` — every connected super-admin. */
  @Sse('admin/stream')
  @UseGuards(SuperAdminGuard)
  adminStream(): Observable<MessageEvent> {
    return this.live.adminStream();
  }

  /** Catalog events marked `user` for this JWT only. */
  @Sse('me/stream')
  meStream(@CurrentUser() user: IAuthUser): Observable<MessageEvent> {
    return this.live.userStream(user.userId);
  }
}
