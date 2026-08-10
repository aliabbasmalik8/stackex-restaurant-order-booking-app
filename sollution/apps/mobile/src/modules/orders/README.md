# Orders module

List and create pickup orders for the signed-in user.

- Hooks: `useUserOrders` → React Query `useOrders`
- Checkout: `createOrder` → `POST /api/orders` (line items + contact stored as JSON snapshots)
