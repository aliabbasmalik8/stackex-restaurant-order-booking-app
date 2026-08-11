import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  useSettingsList,
  useUpdateSetting,
  type DialSetting,
  type SettingItemDto,
  type SettingValue,
} from '@/api/OrderBooking/modules/settings';
import { ApiError } from '@/api/OrderBooking/client';

function isDial(value: SettingValue): value is DialSetting {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const o = value as Record<string, unknown>;
  return (
    typeof o.code === 'string' &&
    typeof o.region === 'string' &&
    typeof o.flag === 'string'
  );
}

function cloneValue(value: SettingValue): SettingValue {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return { ...value };
  }
  return value;
}

function valuesEqual(a: SettingValue, b: SettingValue): boolean {
  if (
    a &&
    b &&
    typeof a === 'object' &&
    typeof b === 'object' &&
    !Array.isArray(a) &&
    !Array.isArray(b)
  ) {
    return JSON.stringify(a) === JSON.stringify(b);
  }
  return a === b;
}

export type SettingsDraft = Record<string, SettingValue>;

type UseSettingsEditorResult = {
  items: SettingItemDto[];
  draft: SettingsDraft;
  loading: boolean;
  saving: boolean;
  error: string | null;
  flash: string | null;
  dirtyKeys: string[];
  isDirty: boolean;
  setFlash: (msg: string | null) => void;
  refresh: () => Promise<void>;
  setScalar: (key: string, value: string | number | boolean) => void;
  setDialField: (field: keyof DialSetting, value: string) => void;
  setDial: (dial: DialSetting) => void;
  save: () => Promise<boolean>;
};

export function useSettingsEditor(): UseSettingsEditorResult {
  const listQuery = useSettingsList();
  const updateMutation = useUpdateSetting();
  const [draft, setDraft] = useState<SettingsDraft>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);

  const items = listQuery.data ?? [];

  useEffect(() => {
    if (!listQuery.data) return;
    const next: SettingsDraft = {};
    for (const item of listQuery.data) {
      next[item.key] = cloneValue(item.value);
    }
    setDraft(next);
  }, [listQuery.data]);

  const dirtyKeys = useMemo(() => {
    const keys: string[] = [];
    for (const item of items) {
      const current = draft[item.key];
      if (current === undefined) continue;
      if (!valuesEqual(current, item.value)) {
        keys.push(item.key);
      }
    }
    return keys;
  }, [draft, items]);

  const refresh = useCallback(async () => {
    setFlash(null);
    setError(null);
    await listQuery.refetch();
  }, [listQuery]);

  const setScalar = useCallback(
    (key: string, value: string | number | boolean) => {
      setDraft((prev) => ({ ...prev, [key]: value }));
      setFlash(null);
    },
    [],
  );

  const setDialField = useCallback((field: keyof DialSetting, value: string) => {
    setDraft((prev) => {
      const current = prev.dial;
      const base: DialSetting = isDial(current)
        ? { ...current }
        : { code: '', region: '', flag: '' };
      return { ...prev, dial: { ...base, [field]: value } };
    });
    setFlash(null);
  }, []);

  const setDial = useCallback((dial: DialSetting) => {
    setDraft((prev) => ({
      ...prev,
      dial: {
        code: dial.code.trim(),
        region: dial.region.trim().toUpperCase(),
        flag: dial.flag.trim(),
      },
    }));
    setFlash(null);
  }, []);

  const save = useCallback(async () => {
    if (dirtyKeys.length === 0) return true;
    setSaving(true);
    setError(null);
    setFlash(null);
    try {
      for (const key of dirtyKeys) {
        const value = draft[key];
        if (value === undefined) continue;
        await updateMutation.mutateAsync({ key, value });
      }
      setFlash('saved');
      return true;
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Failed to save settings';
      setError(message);
      return false;
    } finally {
      setSaving(false);
    }
  }, [dirtyKeys, draft, updateMutation]);

  const loading = listQuery.isLoading;
  const queryError =
    listQuery.error instanceof Error ? listQuery.error.message : null;

  return {
    items,
    draft,
    loading,
    saving,
    error: error ?? queryError,
    flash,
    dirtyKeys,
    isDirty: dirtyKeys.length > 0,
    setFlash,
    refresh,
    setScalar,
    setDialField,
    setDial,
    save,
  };
}
