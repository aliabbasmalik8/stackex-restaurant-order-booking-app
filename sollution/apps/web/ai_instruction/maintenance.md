# Documentation maintenance (required)

Feature registry, feature UI, API client, screens, theme, i18n, or env changes **must** update matching `ai_instruction/` docs in the **same change set**.

| You changed… | Also update |
|--------------|-------------|
| `FeatureId` / `FEATURE_REGISTRY` | [`features/README.md`](./features/README.md) |
| New `VITE_FEATURE_*` | `.env.example` + feature README |
| `src/api/OrderBooking/**` | [architecture.md](./architecture.md) if client contract changed |
| Error display | [error-handling.md](./error-handling.md) |
| Major folders / routes | [architecture.md](./architecture.md) |
