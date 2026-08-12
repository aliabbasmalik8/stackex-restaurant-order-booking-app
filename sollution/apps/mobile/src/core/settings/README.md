# Settings module

→ [`ai_instruction/features/settings`](../../../ai_instruction/features/settings/README.md)

Public settings: fetch `/settings/public` on app load. On failure → catalog defaults and retry after `SETTINGS_FETCH_RETRY_MS` (5 min). No AsyncStorage cache.
