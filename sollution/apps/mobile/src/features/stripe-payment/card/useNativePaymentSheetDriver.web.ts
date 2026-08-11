/**
 * Web stub — native PaymentSheet driver is not used on web.
 * Real implementation: `useNativePaymentSheetDriver.native.ts`
 */
export function useNativePaymentSheetDriver(): never {
  throw new Error(
    'useNativePaymentSheetDriver is native-only. Use the web Elements driver.',
  );
}
