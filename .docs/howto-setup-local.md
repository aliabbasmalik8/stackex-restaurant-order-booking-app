# How to set up (local + prod)

Maintainer guide for wiring Firebase so you can run the Expo app and Admin scripts (`scripts/`).

Paths below are from **template root** (`order-booking-app/`).

---

## Local vs prod (every solution)

For this template (and the same pattern for other Stackex solutions) we keep **two Firebase projects**:

| Project | Typical id | Used for |
|---------|------------|----------|
| **Local** | `restaurent-order-app-local` | Day-to-day development, experiments, safe reseeds |
| **Prod** | `restaurent-order-app-prod` | Live session / hosted preview (e.g. Stackex preview URL) |

| What you configure | Local | Prod |
|--------------------|-------|------|
| Mobile app | `sollution/apps/mobile/.env` pointing at **local** Web config | Same file pointing at **prod** Web config when testing live preview |
| Admin scripts | `scripts/.env` + `scripts/local-service-account.json` | `scripts/.env` + `scripts/prod-service-account.json` |

Switch by changing which project id + service-account file `scripts/.env` points at, and which six `EXPO_PUBLIC_FIREBASE_*` values are in the mobile `.env`.

**Official env values** (api keys, project ids, which file goes where for Stackex) live in the **official Stackex docs (Google Doc)** — treat that as the source of truth for shared credentials. This repo only documents *how* to create and map them; do not commit secrets.

---

## Prefer: reuse existing projects

If `restaurent-order-app-local` / `restaurent-order-app-prod` already exist under `admin@stackex.ai` (or your team account):

1. Pull the current env / key names from the **Stackex Google Doc**.
2. Download or reuse the matching service-account JSON into `scripts/`.
3. Fill `scripts/.env` and `sollution/apps/mobile/.env` (mapping below).
4. Confirm **Cloud Firestore is created/enabled** on that project — [step 1b](#1b-enable-cloud-firestore-required). New or unused projects often fail sync until this is done.
5. Manually paste **`firebase/firestore.custom.rules`** into Firestore → **Rules** → **Publish** — [step 1c](#1c-apply-firestore-security-rules-manual).
6. Skip to [Sync data](#5-sync-data-scripts).

Only follow **from scratch** when you must create new Firebase projects.

---

## From scratch

Use the **`admin@stackex.ai`** Firebase / Google account when possible (team standard). You may use your own account for a personal sandbox — keep those keys out of shared docs and never commit them.

### 1. Create the Firebase project(s)

1. Open [Firebase Console](https://console.firebase.google.com/) signed in as `admin@stackex.ai` (or your account).
2. **Add project** — e.g. `restaurent-order-app-local` and/or `restaurent-order-app-prod`.
3. Enable what this template needs (same as [../firebase/README.md](../firebase/README.md)):
   - **Authentication** → Email/Password (at minimum)
   - **Cloud Firestore** — see [step 1b](#1b-enable-cloud-firestore-required) (required before any sync)

Repeat for both local and prod if both are missing.

### 1b. Enable Cloud Firestore (required)

Creating a Firebase project does **not** always turn on Firestore. If you skip this, `pnpm reseed` / `pnpm clear:firestore` fail with:

`PERMISSION_DENIED: Cloud Firestore API has not been used in project … before or it is disabled`

Do this for **each** project (local and prod):

1. Firebase Console → select the project → **Build** → **Firestore Database** → **Create database**.
2. Pick a location (cannot change later) and mode (production mode is fine — Admin scripts bypass rules; the Expo app needs rules applied separately).
3. Finish creation. If the API was just enabled, wait a minute for it to propagate.
4. Optional direct API link (replace `PROJECT_ID`):  
   `https://console.developers.google.com/apis/api/firestore.googleapis.com/overview?project=PROJECT_ID`  
   Examples:
   - [local](https://console.developers.google.com/apis/api/firestore.googleapis.com/overview?project=restaurent-order-app-local)
   - [prod](https://console.developers.google.com/apis/api/firestore.googleapis.com/overview?project=restaurent-order-app-prod)
5. Apply security rules next — [step 1c](#1c-apply-firestore-security-rules-manual).

### 1c. Apply Firestore security rules (manual)

Admin scripts (`pnpm reseed`) **bypass** rules. The **Expo / web client does not** — without the template rules, catalog reads and auth-owned writes fail in the app.

Source of truth in this repo:

`firebase/firestore.custom.rules`

Do this for **each** project (local and prod):

1. Open the file locally and **copy its entire contents** (all of it — `rules_version` through the closing braces).
2. Firebase Console → select the project → **Build** → **Firestore Database** → **Rules** tab.
3. **Replace** the editor contents with the pasted rules (do not leave the default “deny all” / test-mode stub if it differs).
4. Click **Publish**.
5. Confirm the published rules match the file (especially public read on `branches` / `menu_categories` / `menu_items`, and owner rules on `users` / `orders`).

Direct Rules URLs (after the database exists):

- [local Rules](https://console.firebase.google.com/project/restaurent-order-app-local/firestore/rules)
- [prod Rules](https://console.firebase.google.com/project/restaurent-order-app-prod/firestore/rules)

There is **no** `scripts/` command that uploads rules — this step is always manual (or handled by the preview backend when it provisions a customer project from `firebase/`).

More context: [firebase.md](./firebase.md) · [../firebase/README.md](../firebase/README.md).

### 2. Create an Admin service account → `scripts/`

Needed for Admin tooling (clear / seed Firestore). **Not** for the mobile app.

1. Firebase Console → select the project → **Project settings** (gear) → **Service accounts**.
2. **Generate new private key** → confirm → download the JSON.
3. Save it under `scripts/` (gitignored via `*service-account.json`):

| Project | Suggested filename |
|---------|-------------------|
| Local | `scripts/local-service-account.json` |
| Prod | `scripts/prod-service-account.json` |

4. Configure `scripts/.env` (gitignored):

```bash
cd scripts
cp .env.example .env   # if you do not have one yet
```

Example — **local**:

```env
FIREBASE_PROJECT_ID=restaurent-order-app-local
GOOGLE_APPLICATION_CREDENTIALS=./local-service-account.json
```

Example — **prod**:

```env
FIREBASE_PROJECT_ID=restaurent-order-app-prod
GOOGLE_APPLICATION_CREDENTIALS=./prod-service-account.json
```

Comment / uncomment blocks when switching. Never put this JSON in `sollution/` or as `EXPO_PUBLIC_*`.

Details: [../scripts/README.md](../scripts/README.md).

### 3. Create a Web app → mobile env

The Expo app needs the **public Web client** config. That is **not** inside the service-account JSON.

1. Same project → **Project settings** → **Your apps**.
2. **Add app** → **Web** (`</>`) if none exists (nickname e.g. `order-booking-web`).
3. Copy the Firebase SDK `firebaseConfig` object.
4. Create / edit the mobile env:

```bash
cd sollution/apps/mobile
cp .env.example .env
```

5. **Map** console fields → env keys (only these six — see [environment.md](./environment.md)):

| `firebaseConfig` field | `sollution/apps/mobile/.env` key |
|------------------------|----------------------------------|
| `apiKey` | `EXPO_PUBLIC_FIREBASE_API_KEY` |
| `authDomain` | `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN` |
| `projectId` | `EXPO_PUBLIC_FIREBASE_PROJECT_ID` |
| `storageBucket` | `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET` |
| `messagingSenderId` | `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` |
| `appId` | `EXPO_PUBLIC_FIREBASE_APP_ID` |

Example shape (replace with **your** project’s values):

```env
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=restaurent-order-app-local.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=restaurent-order-app-local
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=restaurent-order-app-local.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
EXPO_PUBLIC_FIREBASE_APP_ID=1:...:web:...
```

- Skip `measurementId` (Analytics) — not part of the contract.
- Optional: `EXPO_PUBLIC_PREVIEW_MODE=1` — [preview-mode.md](./preview-mode.md).
- Restart Expo (`pnpm start`) after changing `.env`.

### 4. Mental model (two different secrets)

```text
Service account JSON  →  scripts/.env          →  Admin SDK (seed / clear)
Web firebaseConfig    →  apps/mobile/.env      →  Expo client (Auth + Firestore)
```

| | Service account | Web config |
|--|-----------------|------------|
| Where | `scripts/*-service-account.json` | Console → Your apps → Web |
| Used by | `scripts/` | `sollution/apps/mobile` |
| Contains | `private_key`, `client_email`, … | `apiKey`, `appId`, … |
| In git? | Never | Never (`.env` gitignored) |

### 5. Sync data (scripts)

**Prerequisite:** Cloud Firestore must already be enabled on the target project ([step 1b](#1b-enable-cloud-firestore-required)). Otherwise you get `Cloud Firestore API has not been used…`.

**Client access:** After seeding, the app still needs published rules from [step 1c](#1c-apply-firestore-security-rules-manual). Seed can succeed while the mobile catalog stays empty/denied if rules were never updated.

With `scripts/.env` pointing at the project you want to touch:

```bash
cd scripts
pnpm install
pnpm clear:firestore -- --dry-run   # safe check
pnpm reseed                         # clear (--yes) then upload seed
```

| Command | What it does |
|---------|----------------|
| `pnpm clear:firestore -- --dry-run` | List docs that would be deleted |
| `pnpm clear:firestore -- --yes` | Delete template collections |
| `pnpm upload:seed` | Upload `firebase/seed-data.json` |
| `pnpm reseed` | Clear then seed |

Seed source: `firebase/seed-data.json`. Full reference: [../scripts/README.md](../scripts/README.md).

**Warning:** Admin writes **bypass** security rules. Pointing `scripts/.env` at **prod** and running `reseed` changes live preview data — dry-run first.

### 6. Run the app

```bash
cd sollution/apps/mobile
pnpm install
pnpm start
```

Ensure mobile `.env` matches the same project you seeded.

---

## Checklist

- [ ] Firebase project(s) exist (local and/or prod) under `admin@stackex.ai` or documented owner
- [ ] **Cloud Firestore created/enabled** on each project (step 1b) — required before sync
- [ ] **`firebase/firestore.custom.rules` copied into Console → Firestore → Rules → Publish** (step 1c) — required for the app client
- [ ] Env / key inventory recorded in **Stackex Google Doc** (official)
- [ ] Service account JSON in `scripts/` (`local-` / `prod-` prefix)
- [ ] `scripts/.env` → `FIREBASE_PROJECT_ID` + `GOOGLE_APPLICATION_CREDENTIALS`
- [ ] Web app created; six keys mapped into `sollution/apps/mobile/.env`
- [ ] Seed via `pnpm reseed` (dry-run on prod first)
- [ ] Expo restarted after env changes

---

## Related

- Env contract (six keys): [environment.md](./environment.md)
- Scripts tooling: [../scripts/README.md](../scripts/README.md)
- Firebase template files: [firebase.md](./firebase.md) · [../firebase/README.md](../firebase/README.md)
- Folder map: [overview.md](./overview.md)
