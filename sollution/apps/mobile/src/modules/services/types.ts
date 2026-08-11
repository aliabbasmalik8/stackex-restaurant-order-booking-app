/**
 * Injectable feature registry.
 *
 * UI must use helpers from this module — never branch on raw env for product
 * availability. See `ai_instruction/features/README.md`.
 */

export type ServiceId =
  | 'passwordLogin'
  | 'phoneLogin'
  | 'createAccountPassword'
  | 'createAccountPhone'
  | 'continueAsGuest'
  | 'appleLogin'
  | 'googleLogin'
  | 'paymentMethods'
  | 'notifications'
  | 'helpSupport';

/** How the control behaves in the UI (user / product priority). */
export type ServiceMode = 'enabled' | 'disabled' | 'hidden';

export type ServiceDefinition = {
  id: ServiceId;
  /**
   * Priority applied **only when** all `requiredEnvKeys` are satisfied
   * (or when there are no required keys).
   */
  mode: ServiceMode;
  /**
   * i18n key when the resolved mode is not `enabled`.
   * Example: `services.previewUnavailable`
   */
  unavailableReasonKey?: string;
  /**
   * Env flags that must be truthy (`1` / `true` / `yes`) for this feature
   * to be considered provisioned. If any are missing:
   * - `alternativeAvailable: true` → resolve to `hidden`
   * - otherwise → resolve to `disabled`
   */
  requiredEnvKeys?: string[];
  /**
   * When required env is missing: hide the control if an alternative path
   * exists (e.g. password login instead of Apple). If false/omitted, show
   * as `disabled` instead.
   */
  alternativeAvailable?: boolean;
};

export type ServiceStatus = {
  id: ServiceId;
  mode: ServiceMode;
  /** Resolved i18n key when not enabled; undefined if enabled. */
  reasonKey?: string;
};
