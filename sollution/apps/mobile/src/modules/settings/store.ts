import { resolveAppSettings, type ResolvedAppSettings } from './resolve';

let memory: ResolvedAppSettings = resolveAppSettings(null);
let hydrated = false;

export function getAppSettings(): ResolvedAppSettings {
  return memory;
}

export function setAppSettings(next: ResolvedAppSettings): void {
  memory = next;
  hydrated = true;
}

export function isAppSettingsHydrated(): boolean {
  return hydrated;
}
