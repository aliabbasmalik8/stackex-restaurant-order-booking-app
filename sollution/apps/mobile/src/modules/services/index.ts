import { SERVICE_REGISTRY } from './registry';
import type { ServiceId, ServiceMode, ServiceStatus } from './types';

function readEnvFlag(key: string | undefined): boolean {
  if (!key) return false;
  const raw = process.env[key]?.trim().toLowerCase();
  return raw === '1' || raw === 'true' || raw === 'yes';
}

/**
 * Resolve effective mode: env enable override → otherwise registry default.
 */
export function resolveServiceMode(id: ServiceId): ServiceMode {
  const def = SERVICE_REGISTRY[id];
  if (readEnvFlag(def.envEnableKey)) return 'enabled';
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
