import { SERVICE_REGISTRY } from './registry';
import type { ServiceId, ServiceMode, ServiceStatus } from './types';

function readEnvFlag(key: string): boolean {
  const raw = process.env[key]?.trim().toLowerCase();
  return raw === '1' || raw === 'true' || raw === 'yes';
}

/** Non-empty env present (for keys/URLs). Rejects explicit off values. */
function readEnvPresent(key: string): boolean {
  const raw = process.env[key]?.trim();
  if (!raw) return false;
  const lower = raw.toLowerCase();
  if (lower === '0' || lower === 'false' || lower === 'no') return false;
  return true;
}

function requiredEnvSatisfied(keys: string[] | undefined): boolean {
  if (!keys?.length) return true;
  return keys.every((key) =>
    key.startsWith('EXPO_PUBLIC_SERVICE_')
      ? readEnvFlag(key)
      : readEnvPresent(key),
  );
}

/**
 * Resolve effective mode:
 * 1. If required env missing → hidden (when alternativeAvailable) else disabled
 * 2. Else apply registry `mode` (user / product priority)
 */
export function resolveServiceMode(id: ServiceId): ServiceMode {
  const def = SERVICE_REGISTRY[id];

  if (!requiredEnvSatisfied(def.requiredEnvKeys)) {
    return def.alternativeAvailable ? 'hidden' : 'disabled';
  }

  return def.mode;
}

export function getServiceStatus(id: ServiceId): ServiceStatus {
  const def = SERVICE_REGISTRY[id];
  const mode = resolveServiceMode(id);
  return {
    id,
    mode,
    reasonKey: mode === 'enabled' ? undefined : def.unavailableReasonKey,
  };
}

export function isServiceEnabled(id: ServiceId): boolean {
  return getServiceStatus(id).mode === 'enabled';
}

/** Render the control at all (`enabled` or `disabled`). */
export function shouldRenderService(id: ServiceId): boolean {
  return getServiceStatus(id).mode !== 'hidden';
}

/** User may activate the control. */
export function isServiceInteractive(id: ServiceId): boolean {
  return getServiceStatus(id).mode === 'enabled';
}

export function listServiceStatuses(): ServiceStatus[] {
  return (Object.keys(SERVICE_REGISTRY) as ServiceId[]).map(getServiceStatus);
}

export type { ServiceId, ServiceMode, ServiceStatus, ServiceDefinition } from './types';
export { SERVICE_REGISTRY, SERVICE_IDS } from './registry';
