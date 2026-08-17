# Orders helpers

List/create orders. API: `src/api/OrderBooking/modules/orders`.  
Card payments feature gate: [`features/stripe-payment`](../../../ai_instruction/features/stripe-payment/README.md).

**Checkout 86:** Nest rejects create with `ITEM_UNAVAILABLE` / `BRANCH_UNAVAILABLE`; mobile maps those via `toAppError` and drops sold-out lines from the cart.

**Delivery range:** Nest rejects create with `OUT_OF_DELIVERY_RANGE` when `customerAddress.lat` / `lng` on the order body is outside every active kitchen radius (`DELIVERY_ADDRESS_REQUIRED` if the pin is missing). Mobile maps those via `toAppError` and shows the bilingual API message.

**Order codes:** integer ticket (`1`, `2`, …) assigned by Postgres on insert. Do not send `orderCode` on create; display the value from the create/list response. Card checkout keeps that create response on `pendingPaymentOrder` (do not rebuild a fake order on the payment screen).
