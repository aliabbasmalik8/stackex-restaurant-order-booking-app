/**
 * Injectable feature registry.
 *
 * UI must use helpers from this module — never branch on raw env for product
 * availability.
 *
 * Always-on (not in registry): continue as guest, cash payment.
 */

export type FeatureId =
  | 'passwordAuth'
  | 'phoneAuth'
  | 'googleAuth'
  | 'appleAuth'
  | 'stripePayment'

export type FeatureMode = 'enabled' | 'disabled' | 'hidden'

export type FeatureDefinition = {
  id: FeatureId
  mode: FeatureMode
  unavailableReasonKey?: string
  requiredEnvKeys?: string[]
  alternativeAvailable?: boolean
}

export type FeatureStatus = {
  id: FeatureId
  mode: FeatureMode
  reasonKey?: string
}
