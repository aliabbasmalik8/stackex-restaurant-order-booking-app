# Orders helpers

List/create orders. API: `src/api/OrderBooking/modules/orders`.  
Card payments feature gate: [`features/stripe-payment`](../../../ai_instruction/features/stripe-payment/README.md).

**Checkout 86:** Nest rejects create with `ITEM_UNAVAILABLE` / `BRANCH_UNAVAILABLE`; mobile maps those via `toAppError` and drops sold-out lines from the cart.
