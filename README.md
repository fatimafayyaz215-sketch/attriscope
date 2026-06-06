# Churn Prediction — Next.js Application

> A production-ready Next.js application using the **App Router**, TypeScript, Tailwind CSS v4, and ESLint.

---

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Getting Started](#getting-started)
4. [Scoring Fields & RavenStack Dataset](#scoring-fields--ravenstack-dataset)
5. [Google Sign-In Configuration](#google-sign-in-configuration)
6. [Folder Structure](#folder-structure)
7. [CSS Variables & Design Tokens](#css-variables--design-tokens)
8. [Naming Conventions](#naming-conventions)
9. [Best Practices](#best-practices)
10. [Scripts](#scripts)

---

## Overview

Next.js is a React framework that provides:

- **App Router** — file-system based routing with React Server Components (RSC) by default.
- **Server & Client Components** — granular control over rendering (SSR, SSG, ISR, CSR).
- **Built-in optimisations** — automatic image optimisation (`<Image />`), font loading, and code splitting.
- **API Routes** — backend endpoints co-located with the frontend inside `src/app/api/`.
- **Proxy** — edge-runtime logic (auth, redirects, A/B tests) via `proxy.ts`.

---

## Implemented Features

- **Authentication Flow**: [Login](http://localhost:3000/login), [Registration](http://localhost:3000/register), and [Forgot Password](http://localhost:3000/forgot-password) screens with modular split-panel designs. Login supports **email/password** and **Google OAuth** (via Supabase).
- **Onboarding Wizard**: A 3-step configuration flow for [Industry Selection](http://localhost:3000/onboarding), [Weight Calibration](http://localhost:3000/onboarding/step-2), and [Data Connection](http://localhost:3000/onboarding/step-3).
- **Dashboard Overview**: The main application shell featuring a persistent sidebar and custom [Dashboard Widgets](http://localhost:3000/dashboard) (KPI Cards, Risk Charts, and Alerts).
- **Risk Analysis**: A specialized [Risk Analysis Workspace](http://localhost:3000/risk-analysis) for predictive scoring, featuring a sticky intelligence panel.
- **Outreach Hub**: A retention-focused [Outreach Hub](http://localhost:3000/outreach-hub) for drafting AI-personalized emails based on risk factors.
- **Data Management**: A [Data Import Wizard](http://localhost:3000/data-management) for CSV uploads with AI-assisted mapping.
- **System Settings**: Advanced [Calibration & Setup](http://localhost:3000/settings) for industry-specific weights and predictive engine parameters.

---

## Tech Stack

| Layer       | Technology                      |
|-------------|---------------------------------|
| Framework   | Next.js 16 (App Router)         |
| Language    | TypeScript                      |
| Styling     | Tailwind CSS v4 + CSS Variables |
| Auth & DB   | Supabase (Auth, PostgreSQL, RLS)|
| AI          | Google Gemini (optional)        |
| Linting     | ESLint + eslint-config-next     |
| Package Mgr | npm                             |

---

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Copy environment variables
cp .env.example .env.local   # then fill in the values

# 3. Start the development server
npm run dev
```

Open http://localhost:3000 in your browser.

### Environment variables

Copy `.env.example` to `.env.local` and fill in:

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL (Project Settings → API) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase `anon` public key |
| `GEMINI_API_KEY` | No | Enables AI explanations, email drafting, and the in-app assistant |

> Google OAuth credentials are **not** stored in `.env.local`. They are configured in the Supabase dashboard (see below).

For production (Vercel), set the same `NEXT_PUBLIC_*` variables under **Project Settings → Environment Variables**, then redeploy if you change them.

---

## Scoring Fields & RavenStack Dataset

ChurnGuard scores each customer using **4 signals**. The upload CSV must include these columns (see `public/saas-sample-customers.csv` for the test template).

| # | App column(s) | What it measures |
|---|---------------|------------------|
| 1 | `last_login_at` | Days since last activity (inactivity) |
| 2 | `current_sessions` + `previous_sessions` | Usage drop (recent vs prior period) |
| 3 | `support_complaints` | Support ticket load |
| 4 | `payment_delay` | Billing/payment risk (`0` = OK, `1` = risk) |

The built-in **sample CSV is synthetic**. For FYP, we use the **RavenStack** Kaggle dataset (`datasets/saas/`). It has **5 files** and **many rows per customer** — the app needs **one row per customer**, so we derive the 4 fields first, then upload.

### RavenStack source files

| File | Role |
|------|------|
| `ravenstack_accounts.csv` | Customer master (`account_id`, `account_name`) |
| `ravenstack_subscriptions.csv` | Billing (`billing_frequency`, `auto_renew_flag`, `downgrade_flag`) |
| `ravenstack_feature_usage.csv` | Daily usage (`usage_date`, `usage_count`) — linked via `subscription_id` |
| `ravenstack_support_tickets.csv` | Support tickets per `account_id` |
| `ravenstack_churn_events.csv` | Churn event log (reason, date — not used as primary validation label) |

**Join path:** `accounts` → `subscriptions` → `feature_usage` (usage has no `account_id`; join through `subscription_id`).

### How we derive the 4 fields

#### 1. Inactivity → `last_login_at`

- **Source:** `ravenstack_feature_usage.csv` (join to `account_id` via subscriptions)
- **Rule:** For each customer, take the **latest `usage_date`** = last time they used the product
- **Note:** Each usage row is **one feature on one day**; `usage_count` is how many times that feature was used that day

#### 2. Usage drop → `current_sessions` + `previous_sessions`

- **Source:** `ravenstack_feature_usage.csv`
- **Rule:** Pick a snapshot date (e.g. last date in the dataset). For each customer:
  - **`current_sessions`** = sum of all `usage_count` in the **last 30 days**
  - **`previous_sessions`** = sum of all `usage_count` in the **30 days before that**
- The app then computes: `usage_drop = (previous - current) / previous`

#### 3. Support complaints → `support_complaints`

- **Source:** `ravenstack_support_tickets.csv`
- **Rule:** For each `account_id`, **count ticket rows** (optionally only tickets in the last 90 days)
- **Example:** `A-2e4581` has 2 ticket rows → `support_complaints = 2`

#### 4. Payment delay → `payment_delay` (proxy)

- **Source:** `ravenstack_subscriptions.csv`
- **Rule:** RavenStack has **no real late-payment column**. Use the latest subscription per customer:
  - `payment_delay = 1` if `auto_renew_flag` is false **or** `downgrade_flag` is true
  - otherwise `payment_delay = 0`
- Document in FYP reports that this is a **billing proxy**, not actual payment failure data
- **`billing_cycle`:** map `billing_frequency` → `monthly` or `yearly` (helps scoring caps; separate from `payment_delay`)

### Output CSV for upload

After derivation, export **one row per customer** with columns like:

```csv
customer_id,name,email,company,last_login_at,current_sessions,previous_sessions,support_complaints,payment_delay,billing_cycle
```

Upload via **Data Management** in the app. Identity fields: `customer_id` ← `account_id`, `name`/`company` ← `account_name`, `email` ← generated (dataset has no email).

### Regenerate the test CSV

```bash
python datasets/saas/build_upload_csv.py
```

Writes **500 rows** to:

- `datasets/saas/saas-sample-customers.csv`
- `public/saas-sample-customers.csv` (downloadable in Data Management)

### Validate the scoring formula (FYP)

Ground truth uses **`churn_flag`** on `ravenstack_accounts.csv` (`True` = churned, `False` = stayed). This is the official yes/no label per account (~22% churn rate in the sample).

```bash
python datasets/saas/validate_formula.py
```

**Prediction rule:** score ≥ 70 → predicted churn; score &lt; 70 → predicted stay (matches the app’s high-risk band).

**Outputs:**

- `datasets/saas/validation_results.csv` — per-customer scores vs `churn_flag`
- `datasets/saas/validation_threshold_sweep.csv` — metrics at thresholds 40, 50, 60, 70

Report **precision, recall, F1**, and the confusion matrix (TP/TN/FP/FN), not accuracy alone.

To optionally compare against the churn *events* log (not recommended for the main FYP result):

```bash
python datasets/saas/validate_formula.py --compare-events
```

---

## Google Sign-In Configuration

Google login is already implemented in code (`src/services/auth.service.ts` → `loginWithGoogle()`, callback at `src/app/auth/callback/route.ts`). Teammates only need to configure **Google Cloud Console** and **Supabase** — no code changes required.

**Production URL:** https://churn-prediction-navy.vercel.app

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
   - **App name:** ChurnGuard AI
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

Confirm these environment variables match the same Supabase project:

```
NEXT_PUBLIC_SUPABASE_URL=https://<PROJECT_REF>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your_anon_key>
```

Redeploy after changing env vars.

### Step 4 — Verify

1. Open `/login` on your deployment (or `http://localhost:3000/login` locally).
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

When ready for any Google user (not just test users), publish the OAuth consent screen in Google Cloud (**Audience** → move from Testing to **In production**). Google may require app verification for sensitive scopes; basic `email` / `profile` / `openid` scopes typically do not.

---

## Folder Structure

```
churn/
├── public/                     # Static assets served at /
│   └── images/
├── src/
│   ├── app/                    # App Router root (Next.js 13+)
│   │   ├── (auth)/             # Route group — shared layout without URL segment
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── register/
│   │   │       └── page.tsx
│   │   ├── (dashboard)/        # Route group — authenticated pages
│   │   │   ├── layout.tsx      # Shared dashboard shell
│   │   │   └── overview/
│   │   │       └── page.tsx
│   │   ├── api/                # API route handlers
│   │   │   └── churn/
│   │   │       └── route.ts
│   │   ├── error.tsx           # Global error boundary (Client Component)
│   │   ├── not-found.tsx       # 404 page
│   │   ├── layout.tsx          # Root layout (html + body)
│   │   ├── page.tsx            # Home page (/)
│   │   └── globals.css         # Global styles & CSS design tokens
│   ├── components/             # Shared, reusable UI components
│   │   ├── layout/             # Layout components (Sidebar, TopBar)
│   │   ├── ui/                 # Primitive components (Button, Input, Card...)
│   │   └── charts/             # Domain-specific chart components
│   ├── features/               # Feature-based modular components
│   │   ├── auth/               # Login, Register, Forgot Password logic
│   │   ├── onboarding/         # Setup wizard steps
│   │   ├── dashboard/          # Analytics widgets
│   │   ├── risk-analysis/      # Risk table and AI panel
│   │   ├── outreach-hub/       # Email editor and context panel
│   │   └── data-management/    # CSV upload and mapping logic
│   ├── hooks/                  # Custom React hooks (use-prefix)
│   ├── lib/                    # Pure utilities, SDK clients, helpers
│   │   ├── api.ts              # Fetch wrappers / API client
│   │   └── utils.ts            # General helpers (cn, formatDate...)
│   ├── services/               # Business-logic layer (server-side)
│   ├── store/                  # Global client state (Zustand / Redux)
│   ├── types/                  # Shared TypeScript interfaces & enums
│   └── constants/              # App-wide constants (routes, config keys)
├── .env.example                # Documented env variable template
├── .eslintrc.json
├── next.config.ts
├── postcss.config.mjs
├── tailwind.config.ts
└── tsconfig.json
```

### Key Special Files

| File            | Purpose                                                      |
|-----------------|--------------------------------------------------------------|
| `layout.tsx`    | Persistent UI wrapper; survives navigation within a segment  |
| `page.tsx`      | The publicly accessible leaf route                           |
| `loading.tsx`   | Suspense-based loading skeleton for the segment              |
| `error.tsx`     | Error boundary (must be a Client Component)                  |
| `not-found.tsx` | Rendered when `notFound()` is called                         |
| `route.ts`      | API route handler (GET, POST, ...)                           |
| `proxy.ts`     | Edge-runtime routing, redirects, and rewrites (replaces middleware) |

---

## CSS Variables & Design Tokens

All design tokens are defined in `src/app/globals.css` under `:root` and are available everywhere.

```css
/* Colours */
color: var(--color-primary);
background-color: var(--color-surface);

/* Typography */
font-size: var(--text-lg);
font-weight: var(--font-semibold);

/* Spacing */
padding: var(--spacing-4);
gap: var(--spacing-6);

/* Shadows & borders */
box-shadow: var(--shadow-md);
border-radius: var(--radius-lg);

/* Motion */
transition: all var(--transition-fast);
```

Dark-mode values are set automatically via `@media (prefers-color-scheme: dark)`.

---

## Naming Conventions

| Item                | Convention           | Example                      |
|---------------------|----------------------|------------------------------|
| Components          | PascalCase           | `ChurnChart.tsx`             |
| Hooks               | camelCase + `use`    | `useChurnData.ts`            |
| Utilities / helpers | camelCase            | `formatPercent.ts`           |
| Constants           | SCREAMING_SNAKE_CASE | `MAX_RETRY_COUNT`            |
| CSS classes         | kebab-case           | `.card-header`               |
| Env variables       | SCREAMING_SNAKE_CASE | `NEXT_PUBLIC_API_BASE_URL`   |
| API route files     | `route.ts`           | `src/app/api/churn/route.ts` |

---

---

## 🛠 Developer Guide & Architecture

This section is intended for developers joining the project to ensure consistency and high code quality across the codebase.

### 🏗 Architecture Principles

We follow a **Feature-Based Modular Architecture**. Instead of placing all logic in global `components/` or `hooks/` folders, we group related logic by domain.

- **`src/features/[feature-name]`**: Contains components, hooks, and types specific to a single business domain (e.g., `risk-analysis`).
- **`src/components/layout`**: Persistent shell components (Sidebar, TopBar) used across the dashboard.
- **`src/components/ui`**: Atomic, "dumb" UI components (Buttons, Inputs, Modals) that are reusable and brand-consistent.
- **`src/app/(dashboard)`**: Uses Next.js **Route Groups** to apply a common layout without affecting the URL structure.

### ⚛️ Component Strategy

- **Server Components by Default**: All files in `src/app` should be Server Components unless they require interactivity.
- **Client Boundary Placement**: Use `"use client"` as far down the component tree as possible. For example, keep the page as a Server Component and wrap only the interactive form in a Client Component.
- **Strict Typing**: Avoid `any`. Use the types defined in `src/types` or local feature-specific types.

### 🎨 Styling & Design Tokens

We use **Tailwind CSS v4** paired with **CSS Variables** defined in `src/app/globals.css`. 

- **Primary Colors**: Use `text-blue-700` or `bg-[#0a235c]` for brand actions.
- **Glassmorphism**: Use `bg-white/80 backdrop-blur-md` for high-end overlays.
- **Responsiveness**: Always use `md:`, `lg:`, and `xl:` prefixes to ensure the dashboard remains usable on all screen sizes.

---

## 🚀 Development Workflow

### 1. Adding a New Screen
1.  Create a new feature folder in `src/features/` if the domain is new.
2.  Build your components in `src/features/[name]/components/`.
3.  Add the route in `src/app/(dashboard)/[name]/page.tsx`.
4.  Update the title mapping in `src/components/layout/TopBar.tsx`.

### 2. Code Quality
```bash
npm run lint      # Check for ESLint errors
npm run build     # Verify the production build (essential before PRs)
```

### 3. Git Workflow
- Create a feature branch from `main`.
- Use descriptive commit messages (e.g., `feat:`, `fix:`, `docs:`, `refactor:`).
- Ensure `npm run build` passes before pushing.

---

## 📜 Scripts

| Script | Purpose |
| :--- | :--- |
| `npm run dev` | Starts the development server with Turbopack |
| `npm run build` | Generates an optimized production build |
| `npm run start` | Serves the production build locally |
| `npm run lint` | Runs the ESLint suite for code quality |


---

## 🔌 Backend Integration

To make backend integration seamless, we have implemented a **Service Layer** pattern.

### 1. API Client (`src/lib/api-client.ts`)
A centralized wrapper around the native `fetch` API. It handles:
- Base URL management via `NEXT_PUBLIC_API_URL`.
- Automatic `Content-Type` header injection.
- Standardized error handling for non-2xx responses.

### 2. Service Layer (`src/services/`)
Each domain (auth, risk, outreach) has its own service file.
- **Example**: `auth.service.ts` contains `login()`, `register()`, etc.
- **Benefit**: Components stay clean; they only call the service and handle the loading/error UI state.

### 3. How to Connect a Component
```tsx
import { authService } from "@/services/auth.service";

// Inside a Client Component:
const handleLogin = async () => {
  setIsLoading(true);
  try {
    const data = await authService.login({ email, password });
    // Handle success (save token, redirect)
  } catch (err) {
    setError(err.message);
  } finally {
    setIsLoading(false);
  }
};
```

---
