import { Injectable, Logger, type OnModuleInit } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  isAppEventName,
  type AppEventMap,
  type AppEventName,
} from '../events';
import { LiveService } from './live.service';

/**
 * Forwards catalog events to live SSE, routed by `LIVE_AUDIENCE`.
 * Add `APP_EVENTS` + audience + emit — no live-listener edit.
 */
@Injectable()
export class LiveListener implements OnModuleInit {
  private readonly logger = new Logger(LiveListener.name);

  constructor(
    private readonly emitter: EventEmitter2,
    private readonly live: LiveService,
  ) {}

  onModuleInit(): void {
    this.emitter.onAny((event, payload: unknown) => {
      const type = Array.isArray(event) ? event.join('.') : String(event);
      if (!isAppEventName(type)) return;
      try {
        this.live.publish(type, payload as AppEventMap[AppEventName]);
      } catch (error) {
        this.logger.error(
          `Live forward failed for ${type}`,
          error instanceof Error ? error.stack : error,
        );
      }
    });
  }
}
