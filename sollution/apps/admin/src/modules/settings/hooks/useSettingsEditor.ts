import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useSettingsList,
  useUpdateSetting,
  type DialSetting,
  type SettingItemDto,
  type SettingValue,
  type StoreStatusSetting,
} from '@/api/OrderBooking/modules/settings';
import { getErrorMessage } from '@/lib/getErrorMessage';

function isDial(value: SettingValue): value is DialSetting {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const o = value as Record<string, unknown>;
  return (
    typeof o.code === 'string' &&
    typeof o.region === 'string' &&
    typeof o.flag === 'string'
  );
}

function isStoreStatus(value: SettingValue): value is StoreStatusSetting {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const o = value as Record<string, unknown>;
  return (
    typeof o.isAvailable === 'boolean' &&
    typeof o.closedMessage === 'string' &&
    typeof o.closedMessageArabic === 'string'
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
  setStoreStatus: (status: StoreStatusSetting) => void;
  setStoreStatusField: <K extends keyof StoreStatusSetting>(
    field: K,
    value: StoreStatusSetting[K],
  ) => void;
  save: () => Promise<boolean>;
};

type UseSettingsEditorOptions = {
  /** When set, dirty/save only consider these keys. */
  keys?: readonly string[];
};

export function useSettingsEditor(
  options: UseSettingsEditorOptions = {},
): UseSettingsEditorResult {
  const { t } = useTranslation();
  const scopedKeys = options.keys;
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
    const scope = scopedKeys ? new Set(scopedKeys) : null;
    for (const item of items) {
      if (scope && !scope.has(item.key)) continue;
      const current = draft[item.key];
      if (current === undefined) continue;
      if (!valuesEqual(current, item.value)) {
        keys.push(item.key);
      }
    }
    return keys;
  }, [draft, items, scopedKeys]);

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

  const setStoreStatus = useCallback((status: StoreStatusSetting) => {
    setDraft((prev) => ({
      ...prev,
      store_status: {
        isAvailable: status.isAvailable,
        closedMessage: status.closedMessage,
        closedMessageArabic: status.closedMessageArabic,
      },
    }));
    setFlash(null);
  }, []);

  const setStoreStatusField = useCallback(
    <K extends keyof StoreStatusSetting>(
      field: K,
      value: StoreStatusSetting[K],
    ) => {
      setDraft((prev) => {
        const current = prev.store_status;
        const base: StoreStatusSetting = isStoreStatus(current)
          ? { ...current }
          : {
              isAvailable: true,
              closedMessage: '',
              closedMessageArabic: '',
            };
        return { ...prev, store_status: { ...base, [field]: value } };
      });
      setFlash(null);
    },
    [],
  );

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
      setError(getErrorMessage(err, t('errors.saveFailed')));
      return false;
    } finally {
      setSaving(false);
    }
  }, [dirtyKeys, draft, t, updateMutation]);

  const loading = listQuery.isLoading;
  const queryError = listQuery.error
    ? getErrorMessage(listQuery.error, t('errors.loadSettings'))
    : null;

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
    setStoreStatus,
    setStoreStatusField,
    save,
  };
}
