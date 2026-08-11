# Card payments (modular)

Platform drivers + shared session — test the session with a mock driver.

## Layout

```text
card/
  types.ts                     # CardPaymentDriver, session types
  useCardPaymentSession.ts     # intent → prepare → confirm → sync (no Stripe SDK)
  useNativePaymentSheetDriver.*  # iOS/Android PaymentSheet
  useWebElementsDriver.*         # Web Payment Element confirm
  usePlatformCardPayment.*       # wires session + driver (+ Form on web)
```

## Test the session

```ts
const driver: CardPaymentDriver = {
  prepare: async () => {},
  confirm: async () => ({ status: 'succeeded' }),
};

const session = useCardPaymentSession({
  orderId: '…',
  driver,
  t: (k) => k,
  createIntent: async () => ({ clientSecret: 'cs_test', … }),
  syncPaymentStatus: async () => ({ paymentStatus: 'paid', … }),
});
```

## Runtime

| Platform | Driver | UI |
|----------|--------|-----|
| iOS / Android | PaymentSheet | modal (no inline form) |
| Web | `confirmPayment` + Payment Element | inline `Form` |

Shared screen: `src/screens/payment/PaymentScreen.tsx` → `usePlatformCardPayment`.
