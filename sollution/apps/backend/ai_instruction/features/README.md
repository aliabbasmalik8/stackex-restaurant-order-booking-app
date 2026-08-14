# Features (product integrations)

**Features** are product-oriented capabilities (e.g. **Stripe**), not Nest folders.

A feature may span **multiple** Nest modules. Each feature folder should include:

1. `README.md` — what it is + **which modules use it and what for**
2. `setup.md` — how to configure it (env, dashboards, webhooks)

Nest module purpose/routes live under [`../modules/`](../modules/README.md).

**Mandatory:** changing a product integration ⇒ update that feature’s `README.md` / `setup.md` **and** every listed module’s “Product features” section ([maintenance.md](../maintenance.md)).

## Index

| Feature | Docs |
|---------|------|
| Stripe (card payments) | [stripe/README.md](./stripe/README.md) · [stripe/setup.md](./stripe/setup.md) |
| Firebase Storage (product images) | [firebase-storage/README.md](./firebase-storage/README.md) · [firebase-storage/setup.md](./firebase-storage/setup.md) |
| Google Maps (reverse geocode) | [google-maps/README.md](./google-maps/README.md) · [google-maps/setup.md](./google-maps/setup.md) |
| Live (SSE change feed) | [live/README.md](./live/README.md) · [live/setup.md](./live/setup.md) |

Add `features/<name>/` when you introduce a cross-module product integration (payments provider, push, OTP, …).

## Related

- [../maintenance.md](../maintenance.md)
- [../modules/README.md](../modules/README.md)
