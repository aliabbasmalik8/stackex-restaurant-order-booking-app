import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import type { AppEventMap } from './utils/catalog';

/**
 * Typed wrapper around Nest `EventEmitter2`.
 * In-process only — no Redis. Listeners must not throw into the producer:
 * emit failures are logged and swallowed so checkout never fails on a bus error.
 */
@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(private readonly emitter: EventEmitter2) {}

  emit<K extends keyof AppEventMap>(event: K, payload: AppEventMap[K]): void {
    try {
      this.emitter.emit(event, payload);
    } catch (error) {
      this.logger.error(
        `Failed to emit ${String(event)}`,
        error instanceof Error ? error.stack : error,
      );
    }
  }
}
