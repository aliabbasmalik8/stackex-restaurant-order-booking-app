# Coding standards

> Adapted from native-builder Nest conventions. Update when API or error patterns change.

## Path aliases

Always use configured aliases (see `tsconfig.json`):

```ts
import { Order } from '@database/entities/Order.model';
import { AuthGuard } from '@shared/guards/auth.guard';
import { AppConfig } from '@utils/config/app.config.type';
```

Do **not** use deep relative imports that cross `database` / `modules` / `shared` / `utils` boundaries.

## Naming

| Kind | Convention | Example |
|------|------------|---------|
| Entity class | PascalCase | `Order`, `AppSetting` |
| Entity file | PascalCase + `.model.ts` | `Order.model.ts` |
| DTO | PascalCase + `Dto` | `CreateOrderDto` |
| Service | PascalCase + `Service` | `PaymentService` |
| Controller | PascalCase + `Controller` | `PaymentController` |
| Module | PascalCase + `Module` | `StripePaymentsModule` |
| Route path | kebab / plural resource | `@Controller('stripe-payments')` |
| DB columns | snake_case | `payment_status`, `user_id` |
| JSON API fields | match catalog / existing camelCase patterns consistently per resource | Settings public keys = catalog keys (`currency_code`) |

## Module file set (minimum)

```text
src/modules/<feature>/
  <feature>.module.ts
  <feature>.controller.ts
  <feature>.service.ts
  <feature>.dto.ts
  README.md
```

Optional: `<feature>.config.ts`, `subservices/`, helpers.

## Controllers

- Thin: validate → call **main module service** → return DTO/entity mapping from service.
- Do **not** inject TypeORM repositories, Stripe SDK, or subservices into controllers.
- Apply guards per-route or per-controller (`AuthGuard`, `SuperAdminGuard`).
- Global prefix is `api` (`main.ts`) — do not repeat `/api` in `@Controller()`.

```ts
@Controller('orders')
@UseGuards(AuthGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  create(@CurrentUser() user: IAuthUser, @Body() dto: CreateOrderDto) {
    return this.orderService.create(user.userId, dto);
  }
}
```

## Services

- One **primary** service per module (controller entrypoint).
- Business rules live here (ownership checks, payment status, catalog defaults).
- Persist **only** via `@database/services/*-db.service` — never inject `Repository`.
- Inject other modules only via Nest module `imports` + **exported** providers.
- Prefer Nest HTTP exceptions that match current codebase (`NotFoundException`, `BadRequestException`, `ForbiddenException`, `ServiceUnavailableException`) until a shared domain exception type is introduced project-wide.
- Log with `Logger` from `@nestjs/common` (or a future shared logger) — no `console.log` for flow control.

### Subservices (when a service grows)

Allowed chain only:

```text
Controller → MainModuleService → Subservice
```

- Put heavy flows in `subservices/` under the same module.
- Do **not** inject subservices into controllers.
- Do **not** nest subservices (no sub-subservices). Promote shared logic to `@shared` or a dedicated module instead.

## DTOs

- All request/response shapes for a feature live in `<feature>.dto.ts` (or clearly named sibling DTO files in the same folder).
- Use `class-validator` + `class-transformer`; global `ValidationPipe` already has `whitelist` + `transform`.
- Never trust client amounts for charging — recompute/load from DB (see payment module).

## Persistence

- Entities under `src/database/entities/`.
- **All DB I/O via `src/database/services/*-db.service.ts`** — see [database-services.md](./database-services.md).
- Do **not** inject `Repository` / use QueryBuilder in `src/modules/**`.
- Methods on `*DbService` must be **purpose-oriented** (`applyPaymentSucceeded`, `updateProfile`) — not generic `update(id, patch)` / `find(where)`.
- Prefer explicit migrations for production; do not invent migrations unless asked.
- `synchronize: false` in `AppModule` — schema changes need SQL/migration + entity update.
- Feature modules do **not** register `TypeOrmModule.forFeature`; `DatabaseModule` owns that.
- **Enforced by ESLint** (`no-restricted-imports`) — `pnpm run lint:check` fails if modules import `Repository` / `InjectRepository` / `TypeOrmModule`. Config adapted from native-builder-backend + DB allowlist.

## White-label & settings (before you code)

Keep the product **easy to white-label**:

- Prefer **modular** Nest modules over one-off scripts and shared brand if/else.
- Prefer **settings** (`SettingService` / catalog) over hardcoded currency, dial, VAT, business name, timezone, etc.
- Prefer **env** only for secrets and infrastructure.
- Prefer **generic logic** that reads config; do not add per-client branches.

If an admin could manage the value → **settings module first** ([modules/setting](./modules/setting/README.md), [architecture white-label](./architecture.md#white-label--admin-managed-config)).

## Env & secrets

- Document every new env key in `.env.example` + the relevant `features/<name>/setup.md` (or module README if module-only).
- `EXPO_PUBLIC_*` / `VITE_*` never hold secret keys.
- Stripe secret + webhook secret → env; currency / business name → **settings**.

## API design checklist

Before merging a new endpoint or module change:

- [ ] Belongs in an existing Nest module or a **new** `src/modules/<name>/`?
- [ ] **`ai_instruction` updated** — see [maintenance.md](./maintenance.md)
- [ ] `ai_instruction/modules/<name>/README.md` matches routes / deps / exports?
- [ ] If a product integration (e.g. Stripe): `features/<feature>/README.md` + `setup.md` + module usage table?
- [ ] Auth correct (public / JWT / super-admin)?
- [ ] DTOs validated; no extra fields leaking via whitelist?
- [ ] No circular module imports (extract shared helper if needed)?
- [ ] White-label: no hardcoded brand/currency/dial/VAT — use **settings** if admin could change it?
- [ ] Logic stays generic/modular (no per-client forks)?
- [ ] Persistence only via `*DbService` (no `Repository` in modules)?

## Related

- [maintenance.md](./maintenance.md)
- [architecture.md](./architecture.md)
- [modules/README.md](./modules/README.md)
- [features/README.md](./features/README.md)
- native-builder-backend skills: `add-module`, `service-structure`, `naming-conventions` (reference only — adapt to this template)
