# Auth module

Email/password auth against Nest (`POST /api/users/login|signup`).
Session tokens live in AsyncStorage (`src/utils/auth/session.ts`).

Profile overlay (phone / address) comes from `GET|PATCH /api/users/me`.
