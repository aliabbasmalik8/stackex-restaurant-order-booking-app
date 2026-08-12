import type { ReactNode } from 'react';
import {
  isFeatureInteractive,
  shouldRenderFeature,
  getFeatureStatus,
} from './resolve';
import type { FeatureId, FeatureStatus } from './types';

/** Current status for a feature id (sync from registry + env). */
export function useFeature(id: FeatureId): FeatureStatus {
  return getFeatureStatus(id);
}

type FeatureGateProps = {
  id: FeatureId;
  children: ReactNode;
  /** When mode is `hidden`. Default: render nothing. */
  fallback?: ReactNode;
};

/** Renders children when the feature is not `hidden`. */
export function FeatureGate({
  id,
  children,
  fallback = null,
}: FeatureGateProps) {
  if (!shouldRenderFeature(id)) return <>{fallback}</>;
  return <>{children}</>;
}

type InteractiveFeatureProps = {
  id: FeatureId;
  children: (ctx: {
    interactive: boolean;
    status: FeatureStatus;
  }) => ReactNode;
};

/** Render-prop helper when you need enabled vs disabled styling. */
export function InteractiveFeature({ id, children }: InteractiveFeatureProps) {
  const status = getFeatureStatus(id);
  if (status.mode === 'hidden') return null;
  return (
    <>
      {children({
        interactive: isFeatureInteractive(id),
        status,
      })}
    </>
  );
}
