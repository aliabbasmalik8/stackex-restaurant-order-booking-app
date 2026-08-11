/**
 * Injectable feature registry.
 *
 * UI must use helpers from this module — never branch on raw env for product
 * availability. See `ai_instruction/features/README.md`.
 *
 * Always-on (not in registry): continue as guest, cash payment.
 * Domain modules (catalog, orders, profile) are not features.
 */

export type FeatureId =
  | 'passwordAuth'
  | 'phoneAuth'
  | 'googleAuth'
  | 'appleAuth'
  | 'stripePayment';

/** How the control behaves in the UI (user / product priority). */
export type FeatureMode = 'enabled' | 'disabled' | 'hidden';

export type FeatureDefinition = {
  id: FeatureId;
  /**
   * Priority applied **only when** all `requiredEnvKeys` are satisfied
   * (or when there are no required keys).
   */
  mode: FeatureMode;
  /**
   * i18n key when the resolved mode is not `enabled`.
   * Example: `features.previewUnavailable`
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
   * exists (e.g. password instead of Apple). If false/omitted, show as
   * `disabled` instead.
   */
  alternativeAvailable?: boolean;
};

export type FeatureStatus = {
  id: FeatureId;
  mode: FeatureMode;
  /** Resolved i18n key when not enabled; undefined if enabled. */
  reasonKey?: string;
};
