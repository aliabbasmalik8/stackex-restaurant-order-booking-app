# Add database entity & DB service

> Adapted from native-builder-backend `.agent/skills/add-database-entity` for this order-booking template.  
> Persistence rules: [database-services.md](./database-services.md).

## Workflow

1. **Create the entity**
   - File: `src/database/entities/<Name>.model.ts`
   - Columns, indexes, types. DB columns = `snake_case`.

2. **Add / extend a purpose-oriented DB service**
   - File: `src/database/services/<name>-db.service.ts`
   - Inject via `@InjectRepository` **only here**
   - Expose named methods (`insertX`, `findByY`, `applyZ`) — not generic `update(id, patch)` / free-form `find(where)`

3. **Register in `DatabaseModule`**
   - `TypeOrmModule.forFeature([Entity])`
   - `providers` + `exports`: `FooDbService`

4. **Wire module services**
   - Feature `*.service.ts` injects `FooDbService` only — never `Repository`

5. **Migration (when asked)**
   ```bash
   npm run generate-migration-file --name=<migration-name>
   npm run migration:run
   ```
   Prefer explicit migrations; do not invent them unless requested.

6. **Docs**
   - Update [database-services.md](./database-services.md) service table
   - Touch module README if routes/deps change ([maintenance.md](./maintenance.md))

## Layer (from native-builder architecture)

```text
Controller → Module service (business)
                → *DbService (persistence)
                     → TypeORM Repository
```

## ESLint gate

`eslint.config.mjs` fails the build/lint if modules import `Repository`, `InjectRepository`, or `TypeOrmModule` outside the allowlist (`database/services`, `database.module.ts`, `app.module.ts`, migrations).

```bash
npm run lint:check
```

## Related

- [database-services.md](./database-services.md)
- [architecture.md](./architecture.md)
- [coding-standards.md](./coding-standards.md)
