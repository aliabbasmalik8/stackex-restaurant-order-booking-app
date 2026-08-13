import { Injectable } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';
import type { LiveStreamMessage } from '../live.types';

/**
 * Admin = one broadcast Subject.
 * User = one Subject per `userId` (created on subscribe, dropped when last client leaves).
 */
@Injectable()
export class SseChannel {
  private readonly admin = new Subject<LiveStreamMessage>();
  private readonly users = new Map<string, Subject<LiveStreamMessage>>();

  adminObservable(): Observable<LiveStreamMessage> {
    return this.admin.asObservable();
  }

  userObservable(userId: string): Observable<LiveStreamMessage> {
    return new Observable((subscriber) => {
      const subject = this.getOrCreateUserSubject(userId);
      const sub = subject.subscribe(subscriber);
      return () => {
        sub.unsubscribe();
        if (!subject.observed) {
          subject.complete();
          this.users.delete(userId);
        }
      };
    });
  }

  publishAdmin(message: LiveStreamMessage): void {
    this.admin.next(message);
  }

  publishUser(userId: string, message: LiveStreamMessage): void {
    this.users.get(userId)?.next(message);
  }

  private getOrCreateUserSubject(userId: string): Subject<LiveStreamMessage> {
    let subject = this.users.get(userId);
    if (!subject) {
      subject = new Subject<LiveStreamMessage>();
      this.users.set(userId, subject);
    }
    return subject;
  }
}
