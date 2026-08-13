import { OnEvent } from '@nestjs/event-emitter';
import type { AppEventMap } from './utils/catalog';

type OnEventOptions = NonNullable<Parameters<typeof OnEvent>[1]>;

/** Typed `@OnEvent` — payload is `AppEventMap[K]`. */
export function OnAppEvent<K extends keyof AppEventMap>(
  event: K,
  options?: OnEventOptions,
): MethodDecorator {
  return OnEvent(event, options);
}
