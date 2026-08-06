/**
 * Preview / white-label service registry.
 *
 * UI must use helpers from this module — never branch on raw env for product
 * availability. See template `.docs/services.md`.
 */

export type ServiceId =
  | 'passwordLogin'
  | 'phoneLogin'
  | 'createAccountPassword'
  | 'createAccountPhone'
  | 'continueAsGuest'
  | 'appleLogin'
  | 'googleLogin';

/** How the control behaves in the UI. */
export type ServiceMode = 'enabled' | 'disabled' | 'hidden';

export type ServiceDefinition = {
  id: ServiceId;
  /** Template default when no env override is set. */
  mode: ServiceMode;
  /**
   * i18n key shown when mode is `disabled` (or when explaining unavailability).
   * Example: `services.previewUnavailable`
   */
  unavailableReasonKey?: string;
  /**
   * Optional Expo public flag. When `"1"` / `"true"`, upgrades to `enabled`
   * (customer purchase / AI config). Not part of the Firebase six-key contract.
   */
  envEnableKey?: string;
};

export type ServiceStatus = {
  id: ServiceId;
  mode: ServiceMode;
  /** Resolved i18n key when not enabled; undefined if enabled. */
  reasonKey?: string;
};
