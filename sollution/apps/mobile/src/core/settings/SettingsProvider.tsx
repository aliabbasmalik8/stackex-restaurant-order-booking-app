import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';
import { getAppSettings } from './store';
import type { ResolvedAppSettings } from './resolve';

const SettingsContext = createContext<ResolvedAppSettings | undefined>(
  undefined,
);

/**
 * Provides settings already bootstrapped during app load.
 * Call `bootstrapAppSettings()` before mounting this (see AppProvider).
 */
export function SettingsProvider({ children }: { children: ReactNode }) {
  const value = useMemo(() => getAppSettings(), []);
  return (
    <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
  );
}

export function useSettings(): ResolvedAppSettings {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    // Safe fallback outside provider (tests / early boot)
    return getAppSettings();
  }
  return ctx;
}

/** Brand-shaped view for existing UI (name / monogram / dial). */
export function useBrand() {
  const s = useSettings();
  return {
    name: s.businessName,
    monogram: s.businessMonogram,
    dialCode: s.dial.code,
    dialFlag: s.dial.flag,
    dialRegion: s.dial.region,
  };
}
