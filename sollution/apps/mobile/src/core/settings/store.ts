import { resolveAppSettings, type ResolvedAppSettings } from './resolve';

let memory: ResolvedAppSettings = resolveAppSettings(null);
let hydrated = false;

type SettingsListener = () => void;
const listeners = new Set<SettingsListener>();

export function getAppSettings(): ResolvedAppSettings {
  return memory;
}

export function setAppSettings(next: ResolvedAppSettings): void {
  memory = next;
  hydrated = true;
  listeners.forEach((listener) => listener());
}

export function subscribeAppSettings(listener: SettingsListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function isAppSettingsHydrated(): boolean {
  return hydrated;
}
