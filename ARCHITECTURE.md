# B4U-GO — Backend & Product Architecture

> Planning doc for turning the current frontend demo into a real product.
> Stack chosen by the team: **Express + TypeScript API**, **Neon (Postgres)**,
> **Cloudflare R2** (object storage), **Gemini** (generation), **Paystack/Flutterwave** (payments).

---

## 0. Reality check — where the code is today

Two things currently *look* like features but are placeholders. Know this before building:

- **Auth is fake.** `frontend/src/lib/auth.ts` stores `{ name }` in `localStorage`, and
  `LoginModal.tsx` only asks for a first name. No password, email, server, or session.
- **Closet + generation are client-only.** Saved looks live in `localStorage` (lost on
  cache clear, not synced across devices). `frontend/src/lib/gemini.ts` is a **mock** —
  it fakes a 2.5s delay and returns hardcoded data via `if/else`. No API call happens.

There is **no backend yet**. Everything below is the plan to build one.

**The one non-negotiable rule:** the Gemini key and all generation logic must live on the
server. Today `gemini.ts` runs in the browser; shipping it that way exposes
`VITE_GEMINI_API_KEY` in DevTools and it *will* be stolen. Generation must move behind an
authenticated endpoint.

---

## 1. System architecture

```
┌─────────────────────────┐
│  Frontend (React + Vite)│
│  - sends session token   │
│    (JWT) on each request │
└───────────┬─────────────┘
            │ HTTPS + Authorization: Bearer <jwt>
            ▼
┌─────────────────────────────────────────────┐
│  Express + TypeScript API (the only place    │
│  that holds secrets)                          │
│                                               │
│  POST /api/generate  ← the gatekeeper         │
│    1. verify JWT (who is this?)               │
│    2. check quota (trials left / subscribed?) │
│    3. call Gemini with the SECRET key         │
│    4. log usage + decrement quota             │
│    5. return outfit                           │
│                                               │
│  /api/auth/*   /api/closet/*   /api/billing/* │
└───┬───────────────┬───────────────┬──────────┘
    │               │               │
    ▼               ▼               ▼
┌─────────┐   ┌────────────┐   ┌──────────────┐
│ Neon    │   │ Cloudflare │   │ Paystack /   │
│(Postgres)│  │ R2 (images)│   │ Flutterwave  │
└─────────┘   └────────────┘   └──────────────┘
```

### Suggested Express project layout
```
backend/
  src/
    index.ts                 # app bootstrap, middleware
    config/env.ts            # typed env loading (zod)
    db/
      client.ts              # Neon connection (pg / drizzle / prisma)
      schema.ts              # table definitions
      migrations/
    middleware/
      auth.ts                # verify JWT -> req.user
      quota.ts               # check + reserve a generation
      errorHandler.ts
    routes/
      auth.routes.ts
      generate.routes.ts
      closet.routes.ts
      billing.routes.ts      # includes payment webhooks
    services/
      gemini.service.ts      # the ONLY caller of the Gemini key
      r2.service.ts          # presigned uploads/downloads
      quota.service.ts
      billing.service.ts
    types/
  package.json
  tsconfig.json
```

**Recommended libs:** `express`, `zod` (validation + env), `drizzle-orm` or `prisma`
(Neon-friendly), `jsonwebtoken` or an auth provider SDK, `@aws-sdk/client-s3` (R2 is
S3-compatible), `pino` (logging).

---

## 2. Authentication

Replace the fake login with real accounts. Two solid options:

- **Roll your own** with Express: email/password (hash with `argon2`/`bcrypt`) + JWT
  sessions + Google OAuth. Most control, most code.
- **Use an auth provider** (Clerk, Auth0, Supabase Auth as *auth-only*) and keep the rest
  of the stack as planned. Less code, faster, offloads password reset / OAuth / security.

For the Nigerian market, offer **Google sign-in** (fast, widely used) + **email/password**
fallback. Phone/OTP can come later.

The frontend `useAuth` hook keeps the same shape — only its internals change (store a JWT
instead of a name), so `App.tsx` and `LoginModal.tsx` barely move:

```ts
// login  -> POST /api/auth/login  -> store returned JWT
// getUser -> read JWT, GET /api/auth/me
// logout -> clear JWT
```

**Every protected request** sends `Authorization: Bearer <jwt>`; the `auth` middleware
verifies it and sets `req.user`. Never trust a user id sent in the body.

---

## 3. Generation + cost control

### The image decision drives everything
Cost and trial generosity depend on what Gemini actually produces:

| Level | What's real | Per-call cost | Notes |
|---|---|---|---|
| **A. Text only** | AI descriptions; image is a hardcoded PNG (may not match text) | ~free | Fine for MVP; users notice the mismatch |
| **B. Text + catalog image** | AI descriptions matched to **real product images** you host in R2 / pull from a store API | ~free + catalog work | Honest: picture matches the words. Recommended |
| **C. Text + AI image** | AI writes text **and** generates a unique outfit image (Imagen) | ~$0.02–0.04 each | Looks magical; clothes aren't buyable; cost dominates |

**Recommendation:** launch with **A** to validate demand (near-free), move to **B** as the
real product (curate a garment catalog in R2, match by tags/occasion/gender), and offer
**C** only as a **premium perk** once economics are proven.

### Rules
- `gemini.service.ts` is the **only** module that reads `GEMINI_API_KEY`.
- Every generation writes a row to `usage_events` (user, model, tokens, cost, timestamp)
  so you can see real economics *before* finalizing prices.
- Validate + sanitize all generation inputs with `zod`.

### Uploaded items (R2)
When a user uploads a clothing photo to style around:
1. Frontend requests a **presigned PUT URL** from `POST /api/uploads/sign`.
2. Frontend uploads the file **directly to R2** (keeps large files off your API).
3. Frontend sends the resulting object key to `/api/generate`.
4. Serve images back via presigned GET URLs or a public R2 bucket + CDN.

---

## 4. Pricing (Nigerian market)

Use **Paystack** or **Flutterwave** — Stripe doesn't serve Nigeria well; these support
cards, bank transfer, and USSD. **Price in ₦.**

| Tier | Price (illustrative — validate!) | Includes |
|---|---|---|
| **Free** | ₦0 | Limited trials (§5), static/catalog images, save up to ~5 looks |
| **Plus** | ~₦2,000–3,000/mo | High/unlimited text generations, unlimited closet, item upload |
| **Premium** | ~₦5,000–7,000/mo | Everything + AI-generated images (Level C), priority, early features |

**Also strongly consider pay-as-you-go credits** (e.g. ₦1,000 = 50 generations) — many
Nigerian users prefer one-off top-ups over subscriptions.

> Numbers are starting points. Set final prices after `usage_events` shows real
> per-generation cost and what users actually do.

### Payment flow
1. User picks a plan → frontend calls `POST /api/billing/checkout`.
2. API creates a Paystack/Flutterwave transaction, returns the checkout URL.
3. User pays on the provider's page.
4. Provider calls your **webhook** `POST /api/billing/webhook` → verify signature →
   activate subscription / add credits in the DB.
   **Trust the webhook, not the frontend redirect**, for granting access.

---

## 5. Free trial design

**Enforce quota server-side on the user record. Never trust the client** — a
`localStorage` counter is bypassed by clearing storage.

Recommended (assuming Level A/B text generation is ~free):

- **Try before signup:** allow **2–3 anonymous generations** (tracked by device/IP
  fingerprint) so users feel the value before the login wall.
- **On signup:** grant **3 generations/day** for free users. (Alternative: *5 total* if you
  want more upgrade urgency; *per-day* favors habit-building and word-of-mouth.)
- Gate the **expensive** stuff (AI images = Level C, upload styling) behind paid tiers
  rather than squeezing the cheap text generation.

### Enforcement (in the generate endpoint, before calling Gemini)
```
if has_active_subscription: allow
elif daily_count < daily_limit: allow, then increment
elif trial_remaining > 0: allow, then decrement
else: return 402 "trial exhausted / upgrade"
```
Reset `daily_count` when `now > daily_reset_at`, then set `daily_reset_at = tomorrow`.

---

## 6. Data model (Postgres / Neon)

```sql
users (
  id            uuid primary key default gen_random_uuid(),
  email         text unique not null,
  name          text,
  password_hash text,            -- null if OAuth-only
  created_at    timestamptz default now()
)

usage (
  user_id           uuid references users(id),
  daily_count       int  default 0,
  daily_reset_at    timestamptz,
  trial_remaining   int  default 5,
  primary key (user_id)
)

subscriptions (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references users(id),
  tier          text,            -- 'plus' | 'premium'
  status        text,            -- 'active' | 'canceled' | 'past_due'
  provider_ref  text,            -- Paystack/Flutterwave id
  expires_at    timestamptz,
  created_at    timestamptz default now()
)

credits (                        -- optional pay-as-you-go
  user_id   uuid references users(id),
  balance   int default 0,
  primary key (user_id)
)

saved_looks (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references users(id),
  vibe       text,
  image_url  text,               -- R2 object key / URL
  top        text,
  bottom     text,
  created_at timestamptz default now()
)

usage_events (                   -- analytics / cost tracking
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references users(id),
  model      text,
  cost_usd   numeric,
  created_at timestamptz default now()
)
```

---

## 7. Environment variables (backend only — never in the frontend)

```
DATABASE_URL=              # Neon connection string
JWT_SECRET=
GEMINI_API_KEY=           # server-side ONLY
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=
R2_PUBLIC_URL=            # or use presigned GETs
PAYSTACK_SECRET_KEY=
PAYSTACK_WEBHOOK_SECRET=
GOOGLE_OAUTH_CLIENT_ID=
GOOGLE_OAUTH_CLIENT_SECRET=
FRONTEND_ORIGIN=          # for CORS
```

Frontend keeps only a public base URL (e.g. `VITE_API_URL`). No secrets in Vite env —
anything prefixed `VITE_` is shipped to the browser.

---

## 8. Build order

1. **Express skeleton** — health check, env loading (zod), Neon connection, error handler.
2. **Auth** — signup/login/me, JWT middleware, Google OAuth. Swap frontend `auth.ts`
   internals (keep the hook's shape).
3. **Move generation server-side** — `POST /api/generate` with the key hidden, real Gemini
   *text* output (Level A). Delete client-side generation.
4. **Closet → DB** — `saved_looks` per user; migrate frontend off `localStorage`.
5. **Quota/trial gate** — `usage` table + `quota` middleware enforcing §5.
6. **R2 uploads** — presigned URLs for uploaded clothing items.
7. **Billing** — Paystack checkout + webhook, tier gating.
8. **Catalog images (Level B)** — curate garments in R2, match by occasion/gender/style.
9. *(Later)* **AI images (Level C)** as a Premium perk.

---

## 9. Security checklist

- [ ] Gemini key + all secrets live only on the backend.
- [ ] Quota/trial enforced server-side, never trusted from the client.
- [ ] All inputs validated (zod) on every endpoint.
- [ ] Rate-limit `/api/generate` (per-user + per-IP) beyond the quota, to blunt abuse.
- [ ] Payment access granted from the **verified webhook**, not the frontend redirect.
- [ ] CORS locked to your frontend origin.
- [ ] Passwords hashed with argon2/bcrypt (if rolling your own auth).
- [ ] Large file uploads go **direct to R2** via presigned URLs, not through the API.
```

