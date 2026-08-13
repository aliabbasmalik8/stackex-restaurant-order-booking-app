import { Injectable, Logger, type MessageEvent } from '@nestjs/common';
import { interval, merge, Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import {
  liveAudiencesFor,
  type AppEventMap,
  type AppEventName,
} from '../events';
import { SseChannel } from './channels/sse.channel';
import type { LiveStreamMessage } from './live.types';

const SSE_PING_MS = 25_000;

@Injectable()
export class LiveService {
  private readonly logger = new Logger(LiveService.name);

  constructor(private readonly sse: SseChannel) {}

  adminStream(): Observable<MessageEvent> {
    return this.withPings(this.sse.adminObservable());
  }

  userStream(userId: string): Observable<MessageEvent> {
    return this.withPings(this.sse.userObservable(userId));
  }

  publish<K extends AppEventName>(type: K, payload: AppEventMap[K]): void {
    try {
      const message = this.toChangeMessage(type, payload);
      const audiences = liveAudiencesFor(type);

      if (audiences.includes('admin')) {
        this.sse.publishAdmin(message);
      }

      if (audiences.includes('user')) {
        const userId = this.targetUserId(payload);
        if (!userId) {
          this.logger.warn(
            `Live audience "user" for ${type} skipped — payload has no userId`,
          );
          return;
        }
        this.sse.publishUser(userId, message);
      }
    } catch (error) {
      this.logger.error(
        `SSE publish failed for ${type}`,
        error instanceof Error ? error.stack : error,
      );
    }
  }

  private withPings(
    changes$: Observable<LiveStreamMessage>,
  ): Observable<MessageEvent> {
    const pings$ = interval(SSE_PING_MS).pipe(
      startWith(0),
      map(() => this.toSseEvent(this.ping())),
    );

    return merge(
      changes$.pipe(map((message) => this.toSseEvent(message))),
      pings$,
    );
  }

  private toChangeMessage<K extends AppEventName>(
    type: K,
    payload: AppEventMap[K],
  ): LiveStreamMessage {
    return {
      type,
      payload,
      at: new Date().toISOString(),
    } as LiveStreamMessage;
  }

  private targetUserId(payload: AppEventMap[AppEventName]): string | null {
    if (
      payload &&
      typeof payload === 'object' &&
      'userId' in payload &&
      typeof payload.userId === 'string' &&
      payload.userId.length > 0
    ) {
      return payload.userId;
    }
    return null;
  }

  private ping(): LiveStreamMessage {
    return { type: 'ping', at: new Date().toISOString() };
  }

  private toSseEvent(message: LiveStreamMessage): MessageEvent {
    return { data: message };
  }
}
