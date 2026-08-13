import { Global, Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { EventsService } from './events.service';

/**
 * In-process domain event bus. Import once from `AppModule`.
 * `@Global()` so any module can inject `EventsService` without re-importing.
 */
@Global()
@Module({
  imports: [
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '.',
      maxListeners: 32,
      verboseMemoryLeak: true,
      ignoreErrors: true,
    }),
  ],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {}
