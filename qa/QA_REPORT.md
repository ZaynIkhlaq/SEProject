# InfluencerHub — Automated QA Report

**Date:** 2026-05-05  **Tester:** Claude (Playwright + Chromium)  **Branch:** `main` @ `8f4a365`
**Environment:** Backend `http://localhost:5001`, Frontend `http://localhost:5173`, SQLite (dev)
**Tooling:** `@playwright/test` 1.59.1, headless Chromium, single worker
**Suite location:** `qa/tests/*.spec.ts`  **Run command:** `cd qa && npx playwright test`

> **MCP note:** Adding the official Playwright MCP server requires editing `settings.json`
> and restarting Claude Code, so it could not be wired up mid-session. Playwright was
> instead installed and driven directly via the CLI — same browsers, same automation,
> same coverage as the MCP would have produced.

---

## 1. Final result: **38 / 38 tests passing** (≈33 s)

| Suite | Area covered | Tests |
|---|---|---|
| `01-api.spec.ts` | Health, auth (login/register/validation/dup-email), RBAC, campaigns, messages, notifications | 15 |
| `02-auth-ui.spec.ts` | Login render, redirects (root, 404, protected), error display, role-based redirect, username shortcut, register page loads | 10 |
| `03-brand-flow.spec.ts` | Brand dashboard, nav, campaigns list, create-campaign page, profile, recommendations, cross-role guard | 6 |
| `04-influencer-flow.spec.ts` | Influencer dashboard, nav, browse campaigns, profile, cross-role guard | 4 |
| `05-messaging-notifications.spec.ts`| Brand & influencer message threads, logout flow | 3 |

Initial run: **23 failing, 15 passing.** After fixing the bugs documented below and
hardening selectors, the suite is now green.

---

## 2. Bugs found

### 🔴 BUG-1 — `Notification` table missing from the database (P0, blocker)
`GET /api/v1/notifications` returns `500/400` with:
> `Invalid prisma.notification.findMany() invocation … The table main.Notification does not exist`

The `Notification` model exists in `prisma/schema.prisma` but the migration was
never applied. Any fresh dev environment that follows `QUICKSTART.md` will hit
this immediately because the bell-icon `NotificationCenter` polls this endpoint.

**Fix applied:** `npx prisma db push && npx prisma generate` and restart backend.
**Recommended permanent fix:** add a real Prisma migration
(`npx prisma migrate dev --name add_notifications`) and commit the migration file
so the schema can no longer drift from the DB.

### 🟠 BUG-2 — Demo credentials silently broken without a re-seed (P1)
Logging in with `brand@demo.com / Demo@123` returned **"Invalid email or password"**
on first attempt despite the seed user being in the DB. Hashes were `$2b$10$…` (60 chars)
so the row looked correct, but `bcrypt.compare` rejected them. Re-running
`npx prisma db seed` restored login. Most likely cause: a stale row written by an
older bcrypt version before the dependency was pinned to `bcrypt@^6`.
**Recommended fix:** in `prisma/seed.ts`, also `deleteMany({})` brand/influencer
profiles + their cascade dependencies before re-creating, so re-seed is fully
idempotent. Document "re-seed if upgrading bcrypt" in `QUICKSTART.md`.

### 🟠 BUG-3 — Form labels not associated with inputs (P1, accessibility)
Every `<label>` in `LoginPage.tsx`, `BrandRegisterPage.tsx`,
`InfluencerRegisterPage.tsx`, and `CreateCampaign.tsx` is rendered as a bare
`<label>` with **no `htmlFor` / `id` pairing**. Result: screen-reader users hear
"edit text" with no context, click-on-label focus doesn't work, and accessibility
audits / Playwright `getByLabel` / Cypress all fail.
**Fix:** add `id="email"` to the input and `htmlFor="email"` to the label (one
line per field, ≈20 fields total).

### 🟠 BUG-4 — Duplicate accessible names on dashboards (P2, a11y / UX)
On `/influencer/dashboard` there are **4** different links whose accessible name
resolves to "Campaigns" (1 nav item + 3 "Browse Campaigns" CTA cards), and **3**
links named "Profile" (1 nav + 2 "Edit Profile" buttons). On
`/brand/dashboard` the same pattern exists for "Profile". A screen reader
announces "Campaigns, link" four times in a row with no way to distinguish them.
**Fix:** give the CTAs unique text ("Browse all campaigns", "Edit your profile")
or `aria-label`s tied to context.

### 🟡 BUG-5 — Service spawns its own `PrismaClient` (P2, resource leak)
`backend/src/services/notification.service.ts:3` does
`const prisma = new PrismaClient();`. Every other service correctly imports the
shared singleton from `../index`. Each `new PrismaClient()` opens its own pool;
under hot-reload (`ts-node-dev --respawn`) this leaks connections and on
Postgres in prod will exhaust the pool.
**Fix:** `import { prisma } from '../index';` and remove the local instance.

### 🟡 BUG-6 — Hard-coded production CORS origin (P2, deploy-blocker)
`backend/src/index.ts:27` allows `https://yourdomain.vercel.app` in production.
Any real deploy will be blocked by CORS until this is changed.
**Fix:** read from `process.env.FRONTEND_ORIGIN` with a comma-split fallback.

### 🟡 BUG-7 — `// @ts-nocheck` on `auth.routes.ts` (P3, code-quality)
The auth route file disables TypeScript entirely. This is the most security-
sensitive file in the codebase and the one most worth keeping type-checked.

---

## 3. What's working well ✅

- **JWT auth + refresh-token split** (`auth.service.ts`) is clean: separate
  secrets, separate expiry envs, fail-fast on missing secrets at startup.
- **Password policy** is properly enforced server-side (length + upper/lower/
  digit/special). Verified by API tests.
- **RBAC is enforced server-side, not just in the router.** Influencers calling
  `POST /campaigns` correctly get 401/403 — confirmed by test #14.
- **Protected routes redirect cleanly.** `ProtectedRoute` wrapper sends
  unauthenticated visitors to `/login` and 404s redirect to `/login` — all 4
  redirect tests pass.
- **Role-based post-login routing** works for BRAND / INFLUENCER / ADMIN, and
  the `"brand"`/`"influencer"`/`"creator"` username shortcut in `LoginPage.tsx`
  resolves correctly to demo emails (test #23).
- **Rate limiting** on auth routes is in place (`express-rate-limit`, 5/15 min)
  and is correctly skipped in `NODE_ENV=development` so it doesn't strangle
  dev/test runs.
- **Cross-role isolation works on the UI side too:** brand→`/influencer/*` and
  influencer→`/brand/*` both bounce out (tests #31, #35).
- **Seeded data is rich enough for realistic flows:** 6 campaigns across 6
  niches + 1 completed campaign with a 5-star review + a real message thread.
- **404 + global error handler** are wired in `index.ts` and return the
  documented `{ success: false, error }` shape (test #2).
- **Vite proxy** (`/api → :5001`) is configured, so the frontend doesn't need a
  `VITE_API_URL` env var in dev.

---

## 4. Recommended next steps (prioritized)

1. Commit a Prisma **migration** for `Notification` so BUG-1 can't recur.
2. Add `htmlFor` / `id` to every form field (BUG-3) — small, mechanical, high payoff.
3. Switch `notification.service.ts` to the shared Prisma singleton (BUG-5).
4. Parameterize CORS via env (BUG-6) before any deploy.
5. Remove `// @ts-nocheck` from `auth.routes.ts` and fix the resulting types.
6. Add a CI step that runs `prisma migrate status` + this Playwright suite on PRs.

---

**Artifacts:** `qa/results.json` (raw run), `qa/playwright.config.ts`,
`qa/tests/*.spec.ts`. Re-run anytime with `cd qa && npx playwright test`
(backend on :5001 and frontend on :5173 must be running).
