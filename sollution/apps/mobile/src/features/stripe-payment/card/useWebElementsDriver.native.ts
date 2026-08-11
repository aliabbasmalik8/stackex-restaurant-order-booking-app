/**
 * Native stub — web Elements driver is not used on native.
 */
export function useWebElementsDriver(_handles: unknown): never {
  throw new Error(
    'useWebElementsDriver is web-only. Use the native PaymentSheet driver.',
  );
}
