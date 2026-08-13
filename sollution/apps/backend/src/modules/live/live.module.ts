import { Module } from '@nestjs/common';
import { SharedModule } from '@shared/shared.module';
import { EventsModule } from '../events/events.module';
import { SseChannel } from './channels/sse.channel';
import { LiveController } from './live.controller';
import { LiveListener } from './live.listener';
import { LiveService } from './live.service';

@Module({
  imports: [SharedModule, EventsModule],
  controllers: [LiveController],
  providers: [LiveService, LiveListener, SseChannel],
})
export class LiveModule {}
