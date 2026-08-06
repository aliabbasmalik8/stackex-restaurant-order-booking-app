# Orders module (Firestore)

Owner-scoped pickup orders: create on checkout, list on the Orders tab.

```text
modules/orders/
  types.ts
  status.ts           # current vs past status sets
  api.ts              # createOrder / fetchOrdersForUser
  hooks/useUserOrders.ts
  index.ts
```

| Status | Filter |
|--------|--------|
| `pending` · `confirmed` · `preparing` · `ready` | Current |
| `completed` · `cancelled` | Previous |

Must stay mapped to `firestore.custom.rules` + `firebase/config.json` (`orders`).
Orders are **not** in `seed-data.json` — created by the app at checkout.
Collection name: `COLLECTIONS.orders` in `modules/catalog/constants.ts`.
