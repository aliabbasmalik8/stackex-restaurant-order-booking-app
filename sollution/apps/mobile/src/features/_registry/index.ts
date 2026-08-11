export {
  resolveFeatureMode,
  getFeatureStatus,
  isFeatureEnabled,
  shouldRenderFeature,
  isFeatureInteractive,
  listFeatureStatuses,
} from './resolve';
export { useFeature, FeatureGate, InteractiveFeature } from './FeatureGate';
export { FEATURE_REGISTRY, FEATURE_IDS } from './registry';
export type {
  FeatureId,
  FeatureMode,
  FeatureStatus,
  FeatureDefinition,
} from './types';
