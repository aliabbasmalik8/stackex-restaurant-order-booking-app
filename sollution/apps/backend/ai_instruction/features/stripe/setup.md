# Stripe — setup

Configure the **Stripe** product feature for this backend.  
Module roles: [README.md](./README.md).

**Docs sync:** env/webhook/settings/order-column changes here must match code and [maintenance.md](../../maintenance.md).

## 1. Stripe account + API keys

1. [dashboard.stripe.com](https://dashboard.stripe.com) → turn **Test mode** on for local work  
2. Developers → API keys  
3. Copy **Secret key** (`sk_test_…`)

```env
STRIPE_SECRET_KEY=sk_test_...
```

Never put `sk_…` in mobile `EXPO_PUBLIC_*`. Publishable key is for the client app only (when you wire mobile).

## 2. Webhook

1. Developers → Webhooks → Add endpoint  
2. URL: `https://<your-api-host>/api/payments/webhook`  
3. Events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`  
4. Reveal signing secret →

```env
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Local forwarding

```bash
stripe listen --forward-to localhost:8000/api/payments/webhook
```

Use the CLI’s `whsec_…` as `STRIPE_WEBHOOK_SECRET` while developing.

**Requires** Nest `rawBody: true` in `main.ts` (already set for signature verification).

## 3. Commerce settings (not env)

Intents read white-label settings (catalog / `app_setting`):

| Key | Purpose |
|-----|---------|
| `currency_code` | Stripe currency (e.g. `aed`) |
| `currency_display` | Display label / metadata |
| `business_name` | PaymentIntent description |
| `business_monogram` | Optional statement descriptor suffix |

See [modules/setting](../../modules/setting/README.md). Override via `PATCH /api/settings/:key`.

## 4. Order schema

Ensure `order` has:

- `payment_method` (`cash` \| `card`)
- `payment_status` (`not_required` \| `unpaid` \| `paid` \| `failed` \| `cancelled`)
- `stripe_payment_intent_id`
- `paid_at`
- Order `status` includes `draft` (card checkout until pay attempt settles)

See [modules/order](../../modules/order/README.md).

## 4b. User schema (Stripe Customer)

`POST /api/payments/intent` lazily creates a Stripe Customer and stores `user.stripe_customer_id`.

Apply manually if the column is missing (no migration in this change):

```sql
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "stripe_customer_id" character varying;
CREATE UNIQUE INDEX IF NOT EXISTS "UQ_user_stripe_customer_id"
  ON "user" ("stripe_customer_id")
  WHERE "stripe_customer_id" IS NOT NULL;
```

## 5. Smoke test

1. Create order with `paymentMethod: "card"` → expect `draft` + `unpaid`  
2. `POST /api/payments/intent` with Bearer JWT + `{ "orderId" }`  
   - Expect `user.stripe_customer_id` set; PaymentIntent has `customer`  
3. Confirm with test card `4242 4242 4242 4242`  
4. Webhook (or `POST /api/payments/sync-payment-status`) → `pending` + `paid`  
5. Abandoned card order stays `draft` — hidden from user list, visible on admin manage

## Env checklist

| Key | Required for Stripe |
|-----|---------------------|
| `STRIPE_SECRET_KEY` | yes |
| `STRIPE_WEBHOOK_SECRET` | yes (for webhook) |
| Settings `currency_code` / `business_name` | yes (defaults exist in catalog) |
