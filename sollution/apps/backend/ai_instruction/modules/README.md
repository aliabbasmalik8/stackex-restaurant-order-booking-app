# Modules (`src/modules/*`)

Docs for **NestJS modules** — each subfolder matches a folder under `src/modules/<name>/`.

```text
ai_instruction/modules/<name>/   ↔   src/modules/<name>/
```

| Concern | Where |
|---------|--------|
| What this Nest module is for, routes, files, deps | **`modules/<name>/README.md`** |
| Scaffold / layering rules | This file (below) |
| Product integrations (Stripe, …) | [`../features/`](../features/README.md) |
| When docs must change | [`../maintenance.md`](../maintenance.md) |

**Mandatory:** changing `src/modules/<name>/` ⇒ update `modules/<name>/README.md` in the same change ([maintenance.md](../maintenance.md)).

## Module index

| Module | Nest path | Doc |
|--------|-----------|-----|
| `auth` | [`src/modules/auth/`](../../src/modules/auth/) | [auth/README.md](./auth/README.md) |
| `stripe-payments` | [`src/modules/stripe-payments/`](../../src/modules/stripe-payments/) | [stripe-payments/README.md](./stripe-payments/README.md) |
| `firebase-storage` | [`src/modules/firebase-storage/`](../../src/modules/firebase-storage/) | [firebase-storage/README.md](./firebase-storage/README.md) |
| `setting` | [`src/modules/setting/`](../../src/modules/setting/) | [setting/README.md](./setting/README.md) |
| `order` | [`src/modules/order/`](../../src/modules/order/) | [order/README.md](./order/README.md) |
| `user` | [`src/modules/user/`](../../src/modules/user/) | [user/README.md](./user/README.md) |
| `address` | [`src/modules/address/`](../../src/modules/address/) | [address/README.md](./address/README.md) |
| `branch` | [`src/modules/branch/`](../../src/modules/branch/) | [branch/README.md](./branch/README.md) |
| `category` | [`src/modules/category/`](../../src/modules/category/) | [category/README.md](./category/README.md) |
| `product` | [`src/modules/product/`](../../src/modules/product/) | [product/README.md](./product/README.md) |
| `events` | [`src/modules/events/`](../../src/modules/events/) | [events/README.md](./events/README.md) |
| `live` | [`src/modules/live/`](../../src/modules/live/) | [live/README.md](./live/README.md) |
| `health` | [`src/modules/health/`](../../src/modules/health/) | [health/README.md](./health/README.md) |

When you add `src/modules/<name>/`, add `ai_instruction/modules/<name>/README.md` + a short pointer README in the Nest folder **in the same PR**.

---

## Scaffold pattern

> Every Nest module should be injectable later (register in `AppModule`, clear exports).

### Checklist

1. `src/modules/<name>/` — `<name>.module.ts`, `.controller.ts`, `.service.ts`, `.dto.ts`
2. Register in `app.module.ts`
3. Docs: `ai_instruction/modules/<name>/README.md` (purpose, routes, deps, feature links)
4. Pointer: `src/modules/<name>/README.md` → that module doc
5. If a **product feature** is introduced (e.g. Stripe), document under `features/<feature>/` (`README.md` + `setup.md`) and list which modules use it — update those modules’ “Product features” sections too ([maintenance.md](../maintenance.md))

### Template

```ts
@Module({
  imports: [TypeOrmModule.forFeature([MyEntity]), SharedModule],
  controllers: [NameController],
  providers: [NameService],
  exports: [NameService], // only if others inject it
})
export class NameModule {}
```

### Dependency rules

| Allowed | Not allowed |
|---------|-------------|
| A imports B and uses **exported** `BService` | A imports B’s private files |
| Uses `@shared` for auth/guards/Firebase Admin | Puts Stripe / events / settings / business policy in `@shared` |
| Reads settings for currency/name / admin knobs | Hardcodes brand/currency/dial/VAT |
| Optional feature: missing env → degrade gracefully | Crash on boot because an addon key is missing |

**White-label:** if an admin could change it, add a **setting** — don’t bake it into module logic ([architecture](../architecture.md#white-label--admin-managed-config)).

### Related

- [../maintenance.md](../maintenance.md)
- [../architecture.md](../architecture.md)
- [../coding-standards.md](../coding-standards.md)
- [../features/README.md](../features/README.md)
