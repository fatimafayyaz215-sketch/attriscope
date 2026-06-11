# Attriscope — Churn Prediction

> A production-ready Next.js application for scoring customer attrition risk, drafting retention outreach, and managing churn intelligence. Built with the **App Router**, TypeScript, Tailwind CSS v4, Supabase, and optional Google Gemini AI.

**Production:** https://churn-prediction-navy.vercel.app

---

## Table of Contents

1. [Overview](#overview)
2. [Implemented Features](#implemented-features)
3. [Tech Stack](#tech-stack)
4. [Getting Started](#getting-started)
5. [Database Setup](#database-setup)
6. [Industries & Scoring](#industries--scoring)
7. [Scoring Fields & Industry Datasets](#scoring-fields--industry-datasets)
8. [Google Sign-In Configuration](#google-sign-in-configuration)
9. [Folder Structure](#folder-structure)
10. [API Routes](#api-routes)
11. [CSS Variables & Design Tokens](#css-variables--design-tokens)
12. [Naming Conventions](#naming-conventions)
13. [Developer Guide & Architecture](#developer-guide--architecture)
14. [Scripts](#scripts)

---

## Overview

Attriscope ingests customer CSV data, scores each account on four behavioral signals, and surfaces high-risk customers for AI-assisted analysis and retention outreach.

**Core workflow:** sign up → onboarding (industry + weights) → CSV upload → dashboard & risk analysis → outreach emails.

**Workspace layout:** the git repo root is `churn-prediction/` (parent folder). The Next.js app lives in `churn-prediction/churn-prediction/`. Python dataset tooling lives in `datasets/` at the repo root (sibling to the app folder).

---

## Implemented Features

- **Landing Page**: Public marketing page at `/` with industry-aware positioning.
- **Authentication**: [Login](http://localhost:3000/login), [Registration](http://localhost:3000/register), and [Forgot Password](http://localhost:3000/forgot-password) with split-panel layouts. Supports **email/password** and **Google OAuth** (via Supabase).
- **Onboarding Wizard**: 3-step flow — [Industry Selection](http://localhost:3000/onboarding), [Weight Calibration](http://localhost:3000/onboarding/step-2), and [Data Connection](http://localhost:3000/onboarding/step-3).
- **Dashboard**: [KPI cards, risk distribution, engagement trend, and alerts](http://localhost:3000/dashboard) inside a persistent sidebar shell.
- **Risk Analysis**: [Predictive scoring workspace](http://localhost:3000/risk-analysis) with filters, deep links (`?level=high&signal=payment`), and a sticky AI intelligence panel.
- **Outreach Hub**: [AI-personalized retention emails](http://localhost:3000/outreach-hub) with tone presets; send status tracked in Supabase.
- **Data Management**: [CSV upload wizard](http://localhost:3000/data-management) with auto column-mapping and per-industry sample downloads.
- **System Settings**: [Industry presets and weight tuning](http://localhost:3000/settings) with formula transparency and bulk recalculation.
- **In-App AI Assistant**: Sidebar advisor chat (rule-based FAQs + optional Gemini) with page-aware context.

---

## Tech Stack

| Layer        | Technology |
|--------------|------------|
| Framework    | Next.js 16 (App Router) |
| UI           | React 19, TypeScript |
| Styling      | Tailwind CSS v4 + CSS variables (`globals.css`) |
| State        | Zustand (`src/store/churn-store.ts`) |
| Charts       | Recharts |
| Auth & DB    | Supabase (Auth, PostgreSQL, RLS) via `@supabase/ssr` |
| AI           | Google Gemini (`@google/generative-ai`) — optional |
| CSV parsing  | PapaParse |
| Route guard  | `src/proxy.ts` (session refresh + protected routes) |
| Linting      | ESLint 9 + `eslint-config-next` |
| Package mgr  | npm |
| FYP tooling  | Python scripts in `datasets/` (pandas) |

---

## Getting Started

All commands below run from the **app directory** (`churn-prediction/churn-prediction/`).

```bash
# 1. Install dependencies
npm install

# 2. Copy environment variables
cp .env.example .env.local        # macOS / Linux
# copy .env.example .env.local    # Windows (cmd)
# Copy-Item .env.example .env.local  # Windows (PowerShell)

# 3. Fill in Supabase values in .env.local (see table below)

# 4. Set up the database (see Database Setup)

# 5. Start the development server
npm run dev
```

Open http://localhost:3000 in your browser.

### Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL (Project Settings → API). No `/rest/v1/` suffix. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase `anon` public key |
| `GEMINI_API_KEY` | No | Enables AI explanations, email drafting, and the in-app assistant |
| `GEMINI_API_KEYS` | No | Comma-separated Gemini keys for rate-limit rotation (overrides `GEMINI_API_KEY` when set) |

> Google OAuth credentials are **not** stored in `.env.local`. Configure them in the Supabase dashboard (see [Google Sign-In](#google-sign-in-configuration)).

For production (Vercel), set the same `NEXT_PUBLIC_*` variables under **Project Settings → Environment Variables**, then redeploy after changes.

---

## Database Setup

1. Create a Supabase project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** and run `supabase/schema.sql` to create tables, indexes, and RLS policies:
   - `customers` — imported and scored customer records
   - `user_settings` — per-user industry and scoring weights
   - `outreach_emails` — drafted/sent retention emails
3. Optionally apply `supabase/migrations/20260521_set_default_weights_to_25_each.sql` if your project was created with older column defaults.
4. Upload auth email templates from `supabase/templates/` via **Authentication → Email Templates** in the Supabase dashboard (`confirm-signup.html`, `reset-password.html`, etc.).

---

## Industries & Scoring

Three supported industries (`src/lib/industry-defaults.ts`):

| Industry | Default weights (inactivity / usage / support / payment) | Risk bands (high / medium) |
|----------|----------------------------------------------------------|----------------------------|
| **Entertainment** | 35 / 30 / 20 / 15 | ≥ 70 / ≥ 40 |
| **SaaS** (default) | 10 / 45 / 15 / 30 | ≥ 70 / ≥ 40 |
| **Education** | 35 / 25 / 15 / 25 | ≥ 50 / ≥ 35 |

Weights are capped so the four sliders sum to ≤ 100%. Users can override presets in **Settings** or during onboarding.

**Billing-cycle caps** (`src/lib/scoring.ts`):

| Cycle | Inactivity cap | Support ticket cap |
|-------|----------------|--------------------|
| Monthly | 30 days | 5 tickets |
| Yearly | 90 days | 10 tickets |

Sample CSVs per industry are in `public/`:

- `saas-sample-customers.csv`
- `entertainment-sample-customers.csv`
- `education-sample-customers.csv`

---

## Scoring Fields & Industry Datasets

Attriscope scores each customer using **4 signals**. Every industry maps different source data into the same upload columns so the app scoring engine stays unchanged.

| # | App column(s) | What it measures |
|---|---------------|------------------|
| 1 | `last_login_at` or `days_inactive` | Days since last activity (inactivity) |
| 2 | `current_sessions` + `previous_sessions` | Usage drop (recent vs prior period) |
| 3 | `support_complaints` | Support ticket load / assessment struggle |
| 4 | `payment_delay` | Billing/payment risk (`0` = OK, `1` = risk) |

Optional: `billing_cycle` (`monthly` / `yearly`) adjusts normalization caps. Columns are auto-mapped on upload via `src/lib/column-detector.ts`.

Sample CSVs (downloadable in **Data Management**):

| Industry | File | Rows (default build) |
|----------|------|----------------------|
| SaaS | `public/saas-sample-customers.csv` | 500 |
| Entertainment | `public/entertainment-sample-customers.csv` | all subscribers in source |
| Education | `public/education-sample-customers.csv` | 1,000 (use `--full` for ~32k) |

---

### SaaS — RavenStack dataset

The built-in **sample CSV is synthetic**. For FYP, we use the **RavenStack** dataset in `datasets/saas/`. It has **5 files** and **many rows per customer** — the app needs **one row per customer**, so we derive the 4 fields first, then upload.

#### RavenStack source files

| File | Role |
|------|------|
| `ravenstack_accounts.csv` | Customer master (`account_id`, `account_name`) |
| `ravenstack_subscriptions.csv` | Billing (`billing_frequency`, `auto_renew_flag`, `downgrade_flag`) |
| `ravenstack_feature_usage.csv` | Daily usage (`usage_date`, `usage_count`) — linked via `subscription_id` |
| `ravenstack_support_tickets.csv` | Support tickets per `account_id` |
| `ravenstack_churn_events.csv` | Churn event log (reason, date — not used as primary validation label) |

**Join path:** `accounts` → `subscriptions` → `feature_usage` (usage has no `account_id`; join through `subscription_id`).

#### How we derive the 4 fields

**1. Inactivity → `last_login_at`**

- **Source:** `ravenstack_feature_usage.csv` (join to `account_id` via subscriptions)
- **Rule:** For each customer, take the **latest `usage_date`** = last time they used the product

**2. Usage drop → `current_sessions` + `previous_sessions`**

- **Source:** `ravenstack_feature_usage.csv`
- **Rule:** Pick a snapshot date (e.g. last date in the dataset). For each customer:
  - **`current_sessions`** = sum of all `usage_count` in the **last 30 days**
  - **`previous_sessions`** = sum of all `usage_count` in the **30 days before that**
- The app computes: `usage_drop = (previous - current) / previous`

**3. Support complaints → `support_complaints`**

- **Source:** `ravenstack_support_tickets.csv`
- **Rule:** For each `account_id`, **count ticket rows** (optionally only tickets in the last 90 days)

**4. Payment delay → `payment_delay` (proxy)**

- **Source:** `ravenstack_subscriptions.csv`
- **Rule:** RavenStack has **no real late-payment column**. Use the latest subscription per customer:
  - `payment_delay = 1` if `auto_renew_flag` is false **or** `downgrade_flag` is true
  - otherwise `payment_delay = 0`
- Document in FYP reports that this is a **billing proxy**, not actual payment failure data

#### Output CSV for upload

```csv
customer_id,name,email,company,last_login_at,current_sessions,previous_sessions,support_complaints,payment_delay,billing_cycle
```

Upload via **Data Management**. Identity fields: `customer_id` ← `account_id`, `name`/`company` ← `account_name`, `email` ← generated (dataset has no email).

#### Regenerate the test CSV

Run from the **repo root** (parent of the app folder):

```bash
python datasets/saas/build_upload_csv.py
```

Writes **500 rows** to:

- `datasets/saas/saas-sample-customers.csv`
- `churn-prediction/public/saas-sample-customers.csv`

**Validate (FYP):** ground truth = `churn_flag` on `ravenstack_accounts.csv` (`True` = churned).

```bash
python datasets/saas/validate_formula.py
python datasets/saas/validate_formula.py --compare-events   # optional; not recommended for main result
```

**Prediction rule:** score ≥ 70 → predicted churn (matches SaaS high-risk band).

**Outputs:** `validation_results.csv`, `validation_threshold_sweep.csv` (thresholds 40, 50, 60, 70). Report precision, recall, F1, and the confusion matrix — not accuracy alone.

---

### Entertainment — Netflix-style dataset

Source: `datasets/entertainment/netflix_large_user_data.csv` (synthetic B2C streaming data).

Entertainment clients do not have SaaS-style session logs. The build script **derives session-like integers** from watch time and engagement so the same four-signal formula applies.

#### Source columns

| Source column | Role |
|---------------|------|
| `Customer ID` | `customer_id` |
| `Daily Watch Time (Hours)` | Proxy for current activity (0.5–5 h range) |
| `Engagement Rate (1-10)` | Proxy for expected / past activity |
| `Support Queries Logged` | `support_complaints` |
| `Payment History (On-Time/Delayed)` | `payment_delay` |
| `Subscription Plan` | `billing_cycle` |
| `Churn Status (Yes/No)` | Ground truth for validation only |

#### How we derive the 4 fields

**1. Inactivity → `days_inactive`**

No `last_login_at` in the source. Lower watch time → higher inferred inactivity (clamped 0–90 to match yearly cap):

```
days_inactive = round( sqrt((5.0 - watch_hours) / 5.0) × 90 )
days_inactive = clamp(0, 90, days_inactive)
```

Example — churned viewer C00002 (1.75 h watch): `(5−1.75)/5 = 0.65` → `√0.65 × 90 ≈ 73` days inactive.

Example — retained viewer C00001 (4.85 h watch): `(5−4.85)/5 = 0.03` → `√0.03 × 90 ≈ 16` days inactive.

At upload, the app can set `last_login_at = upload_date − days_inactive`.

**2. Usage drop → `current_sessions` + `previous_sessions`**

Session-like numbers bridge entertainment metrics to the SaaS formula:

```
current_sessions  = round(watch_hours × 8)      # how much they watch now
previous_sessions = round(engagement_rate × 6)  # how active we expect them to be
```

The app computes: `usage_drop = (previous − current) / previous` (clamped 0–1; 0 if `previous = 0`).

Example — C00002: `current = round(1.75×8) = 14`, `previous = round(9×6) = 54` → usage drop **74.1%** (high engagement expectation, low actual watch → big gap → churn risk).

**3. Support complaints → `support_complaints`**

```
support_complaints = Support Queries Logged
```

**4. Payment delay → `payment_delay`**

```
payment_delay = 1  if Payment History == "Delayed"
payment_delay = 0  otherwise
```

**Billing cycle:**

```
billing_cycle = "monthly"  if Subscription Plan == "Basic"
billing_cycle = "yearly"   otherwise
```

#### Default weights (entertainment preset)

| Factor | Suggested weight |
|--------|------------------|
| Login / Inactivity | 35 |
| Usage Drop | 30 |
| Support Complaints | 20 |
| Payment Delays | 15 |

Matches `INDUSTRY_DEFAULT_WEIGHTS.entertainment` in `src/lib/industry-defaults.ts`.

#### Regenerate the test CSV

```bash
python datasets/entertainment/build_upload_csv.py
```

Writes to `datasets/entertainment/entertainment-sample-customers.csv` and `churn-prediction/public/entertainment-sample-customers.csv`.

**Validate (FYP):** ground truth = `Churn Status` in the source CSV.

```bash
python datasets/entertainment/validate_formula.py
```

**Prediction rule:** score ≥ 70 → predicted churn (matches entertainment high-risk band).

---

### Education — OULAD dataset

Source: **Open University Learning Analytics Dataset (OULAD)** in `datasets/education/`.

**One row = one enrollment** — one student in one course run. Composite key:

```
customer_id = code_module + "-" + code_presentation + "-" + id_student
# e.g. AAA-2013J-238007
```

#### Source files

| OULAD file | What it contains |
|------------|------------------|
| `studentInfo.csv` | Who enrolled, region, `final_result` (Pass / Withdrawn / …) |
| `studentVle.csv` | VLE clicks per day (`date`, `sum_click`, `id_site`) |
| `studentAssessment.csv` | Assessment submissions and scores |
| `assessments.csv` | Assessment due dates |
| `studentRegistration.csv` | Registration and unregistration dates |
| `courses.csv` | Course length (`module_presentation_length`) |

#### OULAD `date` is not a calendar date

In `studentVle.csv`, `date` is a **course day number**:

| `date` value | Meaning |
|--------------|---------|
| `0` | First official day of the course |
| `-10` | 10 days before the course starts (early browsing) |
| `50` | 50 days into the course |
| `243` | Near end of course |

`sum_click` = clicks on **one VLE resource on one day**. A student can have many rows on the same day (one per resource opened). Total VLE usage on a day = sum of all `sum_click` for that student on that day.

#### How we derive the 4 fields

**1. Inactivity → `days_inactive`**

- **Source:** `studentVle.csv`
- **Snapshot date:** latest VLE `date` for the course (`code_module` + `code_presentation`)
- **Last activity:** latest VLE `date` for the student enrollment
- **Formula:** `days_inactive = snapshot_date − last_activity_date`

Example: snapshot at day 243, last click at day 227 → **16 days inactive**.

**2. Usage drop → `current_sessions` + `previous_sessions`**

- **Source:** `studentVle.csv` — sum of `sum_click` in two 28-day windows before snapshot:
  - **`current_sessions`:** `snapshot − 28 < date ≤ snapshot`
  - **`previous_sessions`:** `snapshot − 56 < date ≤ snapshot − 28`

App logic (matches `computeUsageDrop` in `src/lib/scoring.ts`):

```
if previous > 0:
    usage_drop = (previous - current) / previous
elif current = 0 AND previous = 0 AND days_inactive > 28:
    usage_drop = 1.0    # fully disengaged
else:
    usage_drop = 0
```

**3. Support complaints → `support_complaints` (assessment struggle)**

Mapped to SaaS "support tickets." Per assessment, flag if **late** or **low score**:

- **Late:** `date_submitted > due_date + 7` (7-day grace)
- **Low score:** `score < 40`

```
support_complaints = count of (late OR low_score) assessments
```

| Assessment | Due | Submitted | Days after due | Score | Late? | Low score? | Struggle? |
|------------|-----|-----------|----------------|-------|-------|------------|-----------|
| 1752 | 19 | 19 | 0 | 70 | No | No | No |
| 1753 | 54 | 62 | 8 | 62 | Yes | No | **Yes** |
| 1756 | 215 | 223 | 8 | 70 | Yes | No | **Yes** |

**4. Payment delay → `payment_delay` (withdrawal / unregistration)**

- **Source:** `studentRegistration.csv`
- **Rule:** `payment_delay = 1` if `date_unregistration` is set; otherwise `0`
- In OULAD, unregistration = student left the course. The app **floors the score at 50** (education high-risk threshold) when `payment_delay = 1` — see `src/lib/scoring.ts`.

**Billing cycle** (scoring caps only):

- **Source:** `courses.csv` → `module_presentation_length`
- `billing_cycle = "monthly"` if length ≤ 210 course-days (caps: 30d inactivity, 5 support)
- `billing_cycle = "yearly"` if length > 210 (caps: 90d inactivity, 10 support)
- Most OULAD modules are "yearly" (~268 days average)

#### Default weights (education preset)

| Factor | Weight |
|--------|--------|
| Inactivity | 35 |
| Usage Drop | 25 |
| Support | 15 |
| Payment | 25 |

**Risk bands:** high ≥ 50, medium ≥ 35 (calibrated against OULAD withdrawal labels — lower than SaaS/entertainment).

#### Regenerate the test CSV

```bash
python datasets/education/build_upload_csv.py          # 1,000-row sample (default)
python datasets/education/build_upload_csv.py --full   # all enrollments (~32k)
```

Writes to `datasets/education/education-sample-customers.csv` and `churn-prediction/public/education-sample-customers.csv`.

Output uses `days_inactive` directly (no `last_login_at` in the CSV). Upload columns: `customer_id`, `name`, `email`, `company`, `days_inactive`, `current_sessions`, `previous_sessions`, `support_complaints`, `payment_delay`, `billing_cycle`.

**Validate (FYP):** ground truth = `final_result == "Withdrawn"` in `studentInfo.csv`.

```bash
python datasets/education/validate_formula.py
python datasets/education/validate_formula.py --full
```

**Prediction rule:** score ≥ **50** → predicted withdrawal (matches education high-risk band and `EDUCATION_PAYMENT_FLOOR` in the app).

---

## Google Sign-In Configuration

Google login is implemented in `src/services/auth.service.ts` (`loginWithGoogle()`) with the callback at `src/app/auth/callback/route.ts`. Teammates only need to configure **Google Cloud Console** and **Supabase** — no code changes required.

### How the OAuth flow works

1. User clicks **Google** on `/login`
2. Supabase redirects to Google
3. Google returns to Supabase: `https://<PROJECT_REF>.supabase.co/auth/v1/callback`
4. Supabase redirects to your app: `https://<your-domain>/auth/callback`
5. The callback route exchanges the auth code for a session and sends the user to `/onboarding` or `/dashboard`

### Step 1 — Google Cloud Console

1. Open [Google Cloud Console](https://console.cloud.google.com/) and select (or create) a project.
2. Go to **Google Auth Platform → Overview** and click **Get started** if prompted.
3. Complete the setup wizard:
   - **App name:** Attriscope
   - **Audience:** External (any Google account)
   - **Developer contact:** your team email
4. Under **Audience → Test users**, add Gmail addresses that may sign in while the app is in **Testing** mode.
5. Go to **Clients → Create client**:
   - **Application type:** Web application
   - **Authorized JavaScript origins:**
     ```
     https://churn-prediction-navy.vercel.app
     http://localhost:3000
     ```
   - **Authorized redirect URIs** (Supabase callback — **not** your Vercel URL):
     ```
     https://<PROJECT_REF>.supabase.co/auth/v1/callback
     ```
     Replace `<PROJECT_REF>` with the ref from `NEXT_PUBLIC_SUPABASE_URL` (e.g. `fwqsygqaemrgaenmlhfp`).
6. Copy the **Client ID** and **Client Secret**.

### Step 2 — Supabase

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project.
2. **Authentication → Providers → Google**
   - Turn **Enable Sign in with Google** ON
   - Paste the **Client ID** and **Client Secret** from Google Cloud
   - Click **Save**
3. **Authentication → URL Configuration**
   - **Site URL:** `https://churn-prediction-navy.vercel.app` (or your deployment URL)
   - **Redirect URLs** — add all of:
     ```
     https://churn-prediction-navy.vercel.app/**
     https://churn-prediction-navy.vercel.app/auth/callback
     http://localhost:3000/**
     http://localhost:3000/auth/callback
     ```

### Step 3 — Vercel (production)

```
NEXT_PUBLIC_SUPABASE_URL=https://<PROJECT_REF>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your_anon_key>
```

Redeploy after changing env vars.

### Step 4 — Verify

1. Open `/login` locally or on your deployment.
2. Click **Google** and sign in with a test-user Gmail.
3. First-time users land on `/onboarding`; returning users go to `/dashboard`.

### Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| `Unsupported provider: provider is not enabled` | Google not enabled in Supabase | Enable Google under **Authentication → Providers**, paste Client ID + Secret, click **Save** |
| `redirect_uri_mismatch` | Wrong redirect URI in Google Cloud | Use only `https://<PROJECT_REF>.supabase.co/auth/v1/callback` |
| Redirect to `/login?error=auth_callback_failed` | App callback URL not allowed | Add `https://<your-domain>/auth/callback` to Supabase **Redirect URLs** |
| `Access blocked` / app in Testing | Gmail not a test user | Add the account under Google Cloud **Audience → Test users** |
| Works locally, fails on Vercel | Different Supabase project or missing env vars | Align Vercel `NEXT_PUBLIC_SUPABASE_*` with `.env.local` and redeploy |

### Going live (optional)

When ready for any Google user (not just test users), publish the OAuth consent screen in Google Cloud (**Audience** → move from Testing to **In production**). Basic `email` / `profile` / `openid` scopes typically do not require verification.

---

## Folder Structure

```
churn-prediction/                    # Next.js app root (run npm commands here)
├── public/                          # Static assets + industry sample CSVs
├── src/
│   ├── app/
│   │   ├── (dashboard)/             # Authenticated app shell
│   │   │   ├── layout.tsx           # DashboardShell wrapper
│   │   │   ├── dashboard/
│   │   │   ├── risk-analysis/
│   │   │   ├── outreach-hub/
│   │   │   ├── data-management/
│   │   │   └── settings/
│   │   ├── (public)/                # Landing + auth pages
│   │   │   ├── page.tsx             # Landing page (/)
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── forgot-password/
│   │   ├── onboarding/              # 3-step wizard (outside dashboard shell)
│   │   ├── api/                     # Route handlers (see API Routes)
│   │   ├── auth/callback/           # OAuth / magic-link session exchange
│   │   ├── globals.css              # Design tokens + Tailwind
│   │   ├── layout.tsx               # Root layout
│   │   ├── loading.tsx
│   │   ├── error.tsx
│   │   └── not-found.tsx
│   ├── components/
│   │   ├── layout/                  # Sidebar, TopBar, DashboardShell, AdvisorChatPanel
│   │   └── ui/                      # Button, Input
│   ├── features/                    # Domain modules
│   │   ├── auth/
│   │   ├── landing/
│   │   ├── onboarding/
│   │   ├── dashboard/
│   │   ├── risk-analysis/
│   │   ├── outreach-hub/
│   │   ├── data-management/
│   │   └── settings/
│   ├── lib/                         # Scoring, Gemini, Supabase clients, column-detector
│   ├── services/                    # auth.service.ts (Supabase auth)
│   ├── store/                       # Zustand churn-store
│   ├── types/
│   └── proxy.ts                     # Session refresh + route protection
├── supabase/
│   ├── schema.sql
│   ├── migrations/
│   └── templates/                   # Auth email HTML templates
├── .env.example
├── eslint.config.mjs
├── next.config.ts
├── postcss.config.mjs               # Tailwind v4 (no tailwind.config.ts)
├── package.json
└── tsconfig.json

datasets/                            # Repo root — Python FYP tooling (sibling to app)
├── saas/                            # RavenStack derivation + validation
├── entertainment/
└── education/
```

### Key special files

| File | Purpose |
|------|---------|
| `layout.tsx` | Persistent UI wrapper within a route segment |
| `page.tsx` | Publicly accessible leaf route |
| `loading.tsx` | Suspense loading skeleton |
| `error.tsx` | Error boundary (Client Component) |
| `not-found.tsx` | 404 page |
| `route.ts` | API route handler (GET, POST, …) |
| `proxy.ts` | Session refresh, auth redirects, protected routes |

---

## API Routes

All backend logic runs as Next.js route handlers under `src/app/api/`. Client components call these with `fetch("/api/...")`.

| Route | Methods | Purpose |
|-------|---------|---------|
| `/api/upload` | POST | CSV import, scoring, DB insert |
| `/api/customers` | GET, DELETE | List/filter customers; delete all imported data |
| `/api/stats` | GET | Dashboard KPIs and engagement trend |
| `/api/analyze` | POST | AI risk explanation per customer (Gemini + fallback) |
| `/api/generate-email` | POST | AI retention email drafting |
| `/api/send-email` | POST | Record outreach email as sent in DB |
| `/api/settings` | GET, POST | User industry and scoring weights |
| `/api/settings/recalculate` | POST | Re-score all customers after weight changes |
| `/api/app-assistant` | POST | In-app advisor chat |
| `/api/advisor/context` | POST | Page-aware context for advisor panel |
| `/api/status` | GET | Health check |

---

## CSS Variables & Design Tokens

All design tokens are defined in `src/app/globals.css` under `:root`.

```css
color: var(--color-primary);
background-color: var(--color-surface);
font-size: var(--text-lg);
padding: var(--spacing-4);
box-shadow: var(--shadow-md);
border-radius: var(--radius-lg);
transition: all var(--transition-fast);
```

Dark-mode values are set via `@media (prefers-color-scheme: dark)`.

**Brand styling:** `text-blue-700`, `bg-[#0a235c]`, glass overlays with `bg-white/80 backdrop-blur-md`.

---

## Naming Conventions

| Item | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `RiskWorkspace.tsx` |
| Hooks | camelCase + `use` | `useAdvisorChat.ts` |
| Utilities | camelCase | `computeChurnScore.ts` |
| Constants | SCREAMING_SNAKE_CASE | `DEFAULT_WEIGHTS` |
| CSS classes | kebab-case | `.card-header` |
| Env variables | SCREAMING_SNAKE_CASE | `NEXT_PUBLIC_SUPABASE_URL` |
| API route files | `route.ts` | `src/app/api/upload/route.ts` |

---

## Developer Guide & Architecture

### Architecture principles

**Feature-based modular architecture** — domain logic lives in `src/features/[feature-name]/`, not scattered across global folders.

- **`src/features/`** — components and logic per business domain
- **`src/components/layout`** — persistent shell (Sidebar, TopBar, DashboardShell)
- **`src/components/ui`** — reusable primitives (Button, Input)
- **`src/app/(dashboard)`** — route group for authenticated pages with shared layout
- **`src/lib/`** — pure utilities (scoring, Gemini, Supabase clients)
- **`src/services/`** — Supabase auth wrappers (`auth.service.ts`)
- **`src/store/`** — client-side Zustand state

### Component strategy

- **Server Components by default** in `src/app/`
- **`"use client"`** only where interactivity is required
- **Strict typing** — use `src/types/`; avoid `any`

### Adding a new screen

1. Create or extend a folder in `src/features/`.
2. Build components in `src/features/[name]/components/`.
3. Add the route in `src/app/(dashboard)/[name]/page.tsx`.
4. Add a nav item in `src/components/layout/Sidebar.tsx`.
5. Update the title mapping in `src/components/layout/TopBar.tsx`.

### Code quality

```bash
npm run lint      # ESLint
npm run build     # Production build (run before PRs)
```

### Git workflow

- Branch from `main`; use conventional commits (`feat:`, `fix:`, `docs:`, `refactor:`).
- Ensure `npm run build` passes before pushing.

### Backend integration pattern

- **Auth:** `authService` in `src/services/auth.service.ts` wraps the Supabase browser client.
- **Data & AI:** components call same-origin `/api/*` routes directly (no external API server).
- **Database:** Supabase PostgreSQL with RLS; server routes use `src/lib/supabase/server.ts`.

```tsx
import { authService } from "@/services/auth.service";

const handleLogin = async () => {
  setIsLoading(true);
  try {
    const { data, error } = await authService.login({ email, password });
    if (error) throw error;
    // redirect on success
  } catch (err) {
    setError(err instanceof Error ? err.message : "Login failed");
  } finally {
    setIsLoading(false);
  }
};
```

---

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Start development server (Turbopack) |
| `npm run build` | Optimized production build |
| `npm run start` | Serve production build locally |
| `npm run lint` | Run ESLint |
