import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { getAppSettings, subscribeAppSettings } from './store';
import type { ResolvedAppSettings } from './resolve';

const SettingsContext = createContext<ResolvedAppSettings | undefined>(
  undefined,
);

/**
 * Provides settings bootstrapped during app load.
 * Re-renders when `setAppSettings` runs (fetch / retry success).
 */
export function SettingsProvider({ children }: { children: ReactNode }) {
  const [value, setValue] = useState(() => getAppSettings());

  useEffect(() => {
    return subscribeAppSettings(() => {
      setValue(getAppSettings());
    });
  }, []);

  return (
    <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
  );
}

export function useSettings(): ResolvedAppSettings {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
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
