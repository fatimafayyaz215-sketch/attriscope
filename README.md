# Attriscope — Churn Prediction

> A production-ready Next.js application for scoring customer attrition risk, drafting retention outreach, and managing churn intelligence. Built with the **App Router**, TypeScript, Tailwind CSS v4, Supabase, and optional Google Gemini AI.

**Production:** https://churn-prediction-navy.vercel.app

**Repository:** https://github.com/zainch70/churn-old

---

## Table of Contents

1. [Overview](#overview)
2. [Implemented Features](#implemented-features)
3. [Tech Stack](#tech-stack)
4. [Project Configuration](#project-configuration) — local + Vercel production (start here)
5. [Industries & Scoring](#industries--scoring)
6. [Scoring Fields & Industry Datasets](#scoring-fields--industry-datasets)
7. [Folder Structure](#folder-structure)
8. [API Routes](#api-routes)
9. [CSS Variables & Design Tokens](#css-variables--design-tokens)
10. [Naming Conventions](#naming-conventions)
11. [Developer Guide & Architecture](#developer-guide--architecture)
12. [Scripts](#scripts)

---

## Overview

Attriscope ingests customer CSV data, scores each account on four behavioral signals, and surfaces high-risk customers for AI-assisted analysis and retention outreach.

**Core workflow:** sign up → onboarding (industry + weights) → CSV upload → dashboard & risk analysis → outreach emails.

**New teammate?** Start with [Project Configuration](#project-configuration) — one guide for local setup and Vercel production.

**Non-developers / team walkthrough?** See **[TEAM_CODEBASE_GUIDE.md](./TEAM_CODEBASE_GUIDE.md)** — plain-language explanation of every folder, file, and how the app works (no coding background required).

**Workspace layout:** clone [churn-old](https://github.com/zainch70/churn-old) — the **repo root is the Next.js app** (`src/`, `public/`, `package.json`). Optional Python dataset tooling lives in `datasets/` at the same level when included in your clone.

---

## Implemented Features

- **Landing Page**: Public marketing page at `/` with industry-aware positioning.
- **Authentication**: [Login](http://localhost:3000/login), [Registration](http://localhost:3000/register), and [Forgot Password](http://localhost:3000/forgot-password) with split-panel layouts. Supports **email/password** and **Google OAuth** (via Supabase).
- **Onboarding Wizard**: 3-step flow — [Industry Selection](http://localhost:3000/onboarding), [Weight Calibration](http://localhost:3000/onboarding/step-2), and [Data Connection](http://localhost:3000/onboarding/step-3).
- **Dashboard**: [KPI cards, risk distribution, engagement trend, and alerts](http://localhost:3000/dashboard) inside a persistent sidebar shell.
- **Risk Analysis**: [Predictive scoring workspace](http://localhost:3000/risk-analysis) with filters, deep links (`?level=high&signal=payment`), and a sticky AI intelligence panel.
- **Outreach Hub**: [AI-personalized retention emails](http://localhost:3000/outreach-hub) with TipTap rich-text editing (bold, italic, underline, lists), tone presets, **Save Draft** / **View Drafts** (list, open, delete with confirmation — persisted in Supabase), and optional send via **Resend**. For **education**, AI emails include enrolled **course subject** context from the CSV.
- **Data Management**: [CSV upload wizard](http://localhost:3000/data-management) with auto column-mapping and per-industry sample downloads.
- **System Settings**: [Industry presets and weight tuning](http://localhost:3000/settings) with formula transparency and bulk recalculation.
- **In-App AI Assistant**: Sidebar advisor chat (rule-based FAQs + optional Gemini) with page-aware context.

### Outreach Hub — drafts & sending

| Action | Where it goes |
|--------|----------------|
| **Regenerate** | Calls `/api/generate-email` → AI content saved to `outreach_emails` (`status: draft`) |
| **Save Draft** | Calls `/api/outreach/draft` → saves your edited To / Subject / Body to the same table |
| **View Drafts** | Opens a modal listing all saved drafts (`GET /api/outreach/drafts`); click a row to open that customer |
| **Delete draft** | Trash icon in the modal → confirm → `DELETE /api/outreach/draft?draftId=...` |
| **Open customer** | Loads existing draft from `/api/outreach/draft` if present; otherwise auto-generates once per customer visit |
| **Send Email** | Calls `/api/send-email` → Resend (when configured) + marks row `sent` |

Draft rows live in Supabase **`outreach_emails`** (one draft per customer per user). No extra schema is required.

**Note:** The email editor auto-loads once when you select a customer. Use **Regenerate** for a new AI email — opening View Drafts or saving does not re-trigger generation.

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
| Email send   | Resend — optional (`RESEND_API_KEY`) |
| Rich text    | TipTap (`@tiptap/react`, `@tiptap/starter-kit`) — Outreach Hub email editor |
| CSV parsing  | PapaParse |
| Route guard  | `src/proxy.ts` (session refresh + protected routes) |
| Linting      | ESLint 9 + `eslint-config-next` |
| Package mgr  | npm |
| FYP tooling  | Python scripts in `datasets/` (pandas) |

---

## Project Configuration

> **Teammate quick-start:** follow Steps 1–11 in order. Steps 2–5 set up Supabase once (shared by local and production). Step 9 runs the app on your PC. Step 10 deploys to Vercel.

**Repository (clone this):**

```
https://github.com/zainch70/churn-old.git
```

**App folder** (run all `npm` commands here after cloning — same as the repo root):

```
churn-old/
```

**Production URL (team deployment):** https://churn-prediction-navy.vercel.app

---

### Before you start

| Requirement | Required? | Notes |
|-------------|-----------|-------|
| [Node.js 18+](https://nodejs.org) (LTS) | Yes | Check with `node -v` and `npm -v` |
| [Supabase](https://supabase.com) account | Yes | Free tier is enough |
| [Google AI Studio](https://aistudio.google.com/apikey) key | Optional | AI emails, risk explanations, in-app assistant |
| [Google Cloud](https://console.cloud.google.com) project | Optional | Only for “Sign in with Google” |
| [Vercel](https://vercel.com) account | Optional | Only for production deployment |
| [Git](https://git-scm.com/downloads) | Yes | To clone the repository |

---

### Step 1 — Clone the repo and install dependencies

**1.1 Clone the repository** (one-time per machine)

Pick a folder where you keep projects (e.g. `Documents` or `D:\`), then run:

```bash
git clone https://github.com/zainch70/churn-old.git
cd churn-old
```

**Windows (no Git yet):** install [Git for Windows](https://git-scm.com/download/win), then use **Git Bash** for the commands above.

**Already have the repo?** Pull latest changes before setup:

```bash
cd churn-old
git pull
```

**1.2 Install Node.js** (one-time)

1. Download **LTS** from https://nodejs.org and run the installer.
2. Restart your terminal, then verify:

```bash
node -v
npm -v
```

**1.3 Install project packages** (one-time per clone — run inside `churn-old/`, the repo root)

```bash
npm install
```

Wait until it finishes without errors.

---

### Step 2 — Create a Supabase project

Used for **both** local development and production — one Supabase project for the whole team.

1. Go to [supabase.com](https://supabase.com) → **Sign up** / **Sign in**.
2. Click **New project**.
3. Set:
   - **Name:** `Attriscope` (or any name)
   - **Database password:** save this somewhere safe
   - **Region:** closest to your team
4. Click **Create new project** and wait ~2 minutes.

**Copy your API credentials** (you will need them in Step 6):

1. **Settings** (gear icon, bottom of left sidebar) → **General** → copy **Project URL** → this becomes `NEXT_PUBLIC_SUPABASE_URL`
2. **Settings** → **API Keys** → under **Publishable key**, click the copy icon on the **default** row → this becomes `NEXT_PUBLIC_SUPABASE_ANON_KEY`

> The URL looks like `https://abcdefgh.supabase.co` — do **not** add `/rest/v1/` at the end.
>
> The publishable key looks like `sb_publishable_...` — safe for the browser when RLS is enabled (this project uses RLS). Use the **Publishable** key only — **never** put a **Secret** key (`sb_secret_...`) in `.env.local` or Vercel.
>
> **Legacy dashboard:** if your project still shows **Project Settings → API → anon public**, that key works too — paste it into `NEXT_PUBLIC_SUPABASE_ANON_KEY` the same way.

---

### Step 3 — Create database tables

1. In Supabase, open **SQL Editor** → **New query**.
2. On your computer, open `supabase/schema.sql` in this repo.
3. Copy **all** the SQL, paste into the editor, click **Run**.
4. Success = no red errors. This creates:
   - `customers` — imported + scored records
   - `user_settings` — industry and scoring weights
   - `outreach_emails` — drafted/sent retention emails

**Optional:** if the project was created with older defaults, also run `supabase/migrations/20260521_set_default_weights_to_25_each.sql`.

---

### Step 4 — Configure Supabase Auth

**4.1 Email login (required)**

1. **Authentication** → **Providers** → ensure **Email** is **enabled**.
2. For easier local testing, you may disable **Confirm email** under **Authentication → Email** (re-enable for production).

**4.2 Redirect URLs (required for login)**

Go to **Authentication** → **URL Configuration**.

Add **both** local and production URLs so the same Supabase project works everywhere:

| Setting | Value |
|---------|-------|
| **Site URL** | `http://localhost:3000` for local-first setup, or your Vercel URL for production-first |
| **Redirect URLs** | Add every line below |

```
http://localhost:3000/**
http://localhost:3000/auth/callback
http://localhost:3000/reset-password
https://churn-prediction-navy.vercel.app/**
https://churn-prediction-navy.vercel.app/auth/callback
https://churn-prediction-navy.vercel.app/reset-password
```

Password reset flow: **Forgot password** → email link → `/auth/callback?next=/reset-password` → `/reset-password` form.

Replace the Vercel hostname if your team uses a different deployment URL. Click **Save**.

---

### Step 5 — Email templates (recommended)

Branded auth emails live in `supabase/templates/`:

| File | Supabase template |
|------|-------------------|
| `confirm-signup.html` | Confirm signup |
| `reset-password.html` | Reset password |
| `magic-link.html` | Magic link |
| `email-change.html` | Change email |
| `invite.html` | Invite user |

For each: open the `.html` file → copy content → paste in **Authentication → Email Templates** → **Save**.

---

### Step 6 — Environment variables

#### Local — `.env.local`

From the app folder:

```bash
cp .env.example .env.local        # macOS / Linux
copy .env.example .env.local      # Windows (cmd)
Copy-Item .env.example .env.local  # Windows (PowerShell)
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_publishable_key

# Optional — leave blank if you skip Step 7
GEMINI_API_KEY=

# Optional — Resend (Outreach Hub send email; Step 7b)
# RESEND_API_KEY=
# RESEND_TEST_RECIPIENT=you@resend-signup-email.com
```

| Variable | Required | Where to get it |
|----------|----------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase → **Settings → General** → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase → **Settings → API Keys** → **Publishable key** → copy |
| `GEMINI_API_KEY` | No | [Google AI Studio](https://aistudio.google.com/apikey) (Step 7) |
| `GEMINI_API_KEYS` | No | Comma-separated keys; overrides `GEMINI_API_KEY` when set |
| `RESEND_API_KEY` | No | [Resend](https://resend.com) — Outreach Hub **Send Email** (Step 7b) |
| `RESEND_TEST_RECIPIENT` | No | Your Resend account email — required in test mode to receive sends |
| `RESEND_FROM_EMAIL` | No | Verified sender; defaults to `Attriscope <onboarding@resend.dev>` |

> Google OAuth credentials are **not** in `.env.local` — they go in Supabase (Step 8).

**After changing `.env.local`, restart the dev server** (`Ctrl+C`, then `npm run dev` again).

#### Production — Vercel (Step 10)

Same variables in Vercel → **Project Settings → Environment Variables** for **Production** (and **Preview** if you want):

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
GEMINI_API_KEY=your_gemini_key
RESEND_API_KEY=your_resend_key
```

Redeploy after any env change.

---

### Step 7b — Resend email sending (optional)

Enables: **Send Email** in Outreach Hub (drafts are always saved to Supabase regardless).

**Without Resend:** AI drafting, draft save/load, and editing still work — only live send is disabled.

1. Sign up at [resend.com](https://resend.com) and create an API key.
2. Add to `.env.local` (and Vercel env vars for production):

```env
RESEND_API_KEY=re_xxxxxxxx
RESEND_TEST_RECIPIENT=you@resend-signup-email.com
```

3. While using the default test sender (`onboarding@resend.dev`), outbound mail is redirected to `RESEND_TEST_RECIPIENT`.
4. Restart `npm run dev` locally, or redeploy on Vercel.

---

### Step 7 — Google Gemini API (optional)

Enables: AI risk explanations, Outreach Hub email drafting, in-app advisor chat.

**Without Gemini:** login, CSV upload, scoring, dashboard, and risk analysis still work.

1. Go to [aistudio.google.com/apikey](https://aistudio.google.com/apikey).
2. Sign in → **Create API key** → copy it.
3. Add to `.env.local` (local) and Vercel env vars (production):

```env
GEMINI_API_KEY=your_key_here
```

4. Restart `npm run dev` locally, or redeploy on Vercel.

---

### Step 8 — Google Sign-In (optional)

Skip this if email/password login is enough. No code changes — only dashboard configuration.

**How OAuth works:**

1. User clicks **Google** on `/login`
2. Supabase → Google → back to Supabase: `https://<PROJECT_REF>.supabase.co/auth/v1/callback`
3. Supabase → your app: `https://<your-domain>/auth/callback`
4. App sends new users to `/onboarding`, returning users to `/dashboard`

**8.1 Google Cloud Console**

1. [Google Cloud Console](https://console.cloud.google.com/) → create or select a project.
2. **Google Auth Platform → Overview** → complete setup if prompted:
   - **App name:** Attriscope
   - **Audience:** External
3. **Audience → Test users** → add Gmail addresses allowed while app is in **Testing** mode.
4. **Clients → Create client** → **Web application**:
   - **Authorized JavaScript origins:**
     ```
     http://localhost:3000
     https://churn-prediction-navy.vercel.app
     ```
   - **Authorized redirect URIs** (Supabase only — **not** localhost or Vercel):
     ```
     https://<PROJECT_REF>.supabase.co/auth/v1/callback
     ```
5. Copy **Client ID** and **Client Secret**.

**8.2 Enable in Supabase**

1. **Authentication → Providers → Google** → Enable ON.
2. Paste Client ID + Client Secret → **Save**.

**Going live (optional):** publish the OAuth consent screen in Google Cloud (**Audience** → **In production**). Basic `email` / `profile` / `openid` scopes usually do not need verification.

---

### Step 9 — Run locally

Every time you develop on your machine:

```bash
cd churn-old
npm run dev
```

Open **http://localhost:3000** in your browser.

Stop the server: **Ctrl + C** in the terminal.

**First-time app flow:**

1. **Register** at http://localhost:3000/register
2. Complete **Onboarding** (industry → weights → data connection)
3. **Data Management** → download a sample CSV → upload it
4. Check **Dashboard** and **Risk Analysis**

**Useful commands:**

```bash
npm run lint    # check code quality
npm run build   # verify production build before pushing
```

---

### Step 10 — Deploy to production (Vercel)

**10.1 Connect the repo**

1. Push this project to GitHub (if not already).
2. Sign in at [vercel.com](https://vercel.com) → **Add New → Project**.
3. Import the GitHub repo.
4. Leave **Root Directory** empty (`.` — the Next.js app is the GitHub repo root, not a subfolder).
5. Framework preset: **Next.js** (auto-detected).

**10.2 Environment variables**

In Vercel → **Settings → Environment Variables**, add (same as Step 6):

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase publishable key (`sb_publishable_...`) |
| `GEMINI_API_KEY` | Your Gemini key (optional) |
| `RESEND_API_KEY` | Your Resend key (optional) |

**10.3 Deploy**

Click **Deploy**. Vercel assigns a URL like `https://your-app.vercel.app`.

**10.4 Post-deploy checklist**

1. **Supabase** → **Authentication → URL Configuration**:
   - Add your Vercel URL to **Redirect URLs** (if not already in Step 4):
     ```
     https://your-app.vercel.app/**
     https://your-app.vercel.app/auth/callback
     ```
   - Set **Site URL** to your Vercel URL for production-first auth emails.
2. **Google Cloud** (if using Google login): add your Vercel URL to **Authorized JavaScript origins**.
3. Visit `https://your-app.vercel.app/login` and test register + login.

**Redeploy** after changing env vars: Vercel → **Deployments** → **Redeploy**.

---

### Step 11 — Verify everything works

| Check | Local | Production |
|-------|-------|------------|
| Home page loads | http://localhost:3000 | `https://your-app.vercel.app` |
| Email register + login | `/register` → `/onboarding` | Same on Vercel URL |
| Password reset | `/forgot-password` → email → `/reset-password` | Same on Vercel URL |
| Google login (if enabled) | `/login` → Google | Test-user Gmail only while in Testing |
| CSV upload | Data Management → sample CSV | Same |
| Dashboard shows data | `/dashboard` | Same |
| AI explanation | Risk Analysis → select customer | Needs `GEMINI_API_KEY` |

---

### Setup checklist

| Step | Task | Done |
|------|------|------|
| 1 | Repo cloned, Node.js installed, `npm install` completed | ☐ |
| 2 | Supabase project created | ☐ |
| 3 | `schema.sql` run in SQL Editor | ☐ |
| 4 | Redirect URLs added (localhost + Vercel) | ☐ |
| 5 | Email templates pasted (optional) | ☐ |
| 6 | `.env.local` filled with Supabase keys | ☐ |
| 7 | `GEMINI_API_KEY` added (optional) | ☐ |
| 8 | Google OAuth in Cloud + Supabase (optional) | ☐ |
| 9 | `npm run dev` → localhost:3000 works | ☐ |
| 10 | Vercel env vars set + deployed | ☐ |
| 11 | Login + CSV upload tested on production | ☐ |

---

### Troubleshooting

| Problem | Fix |
|---------|-----|
| `npm` / `node` not recognized | Install Node.js LTS, restart terminal |
| Page won’t load on localhost:3000 | Ensure `npm run dev` is running; read terminal errors |
| Login fails / Unauthorized | Check `.env.local` URL and publishable key (**Settings → API Keys**); no typos, no secret key |
| Register works, login fails | Disable “Confirm email” in Supabase for testing, or confirm via email |
| Redirect to `/login?error=auth_callback_failed` | Add `http://localhost:3000/auth/callback` (or Vercel equivalent) to Supabase **Redirect URLs** |
| `Unsupported provider: provider is not enabled` | Enable Google under Supabase **Authentication → Providers** |
| `redirect_uri_mismatch` (Google) | Redirect URI must be `https://<PROJECT_REF>.supabase.co/auth/v1/callback` only |
| `Access blocked` (Google) | Add Gmail under Google Cloud **Audience → Test users** |
| AI features don’t work | Set `GEMINI_API_KEY`, restart dev server or redeploy Vercel |
| Send Email fails in Outreach Hub | Set `RESEND_API_KEY` and `RESEND_TEST_RECIPIENT` (test sender mode); restart or redeploy |
| Draft not loading after save | Confirm you reopened the same customer; drafts are keyed by `customer_id` + your user |
| Education emails missing course name | Re-upload CSV with `course_subject`; set industry to **education** in Settings |
| `course_subject` not auto-mapped | Map column manually in Data Management upload wizard, or rename header to `course_subject` |
| Works locally, fails on Vercel | Match Vercel env vars to `.env.local`; redeploy |
| CSV upload fails | Finish onboarding; use a sample CSV from Data Management |
| Changed `.env.local`, no effect | Stop server (`Ctrl+C`), run `npm run dev` again |
| Password reset link expired | Request a new link at `/forgot-password`; links expire in ~1 hour |
| Reset lands on login with error | Ensure `/auth/callback` and `/reset-password` are in Supabase **Redirect URLs** |

---

## Industries & Scoring

Three supported industries (`src/lib/industry-defaults.ts`):

| Industry | Default weights (inactivity / usage / support / payment) | Risk bands (high / medium) |
|----------|----------------------------------------------------------|----------------------------|
| **Entertainment** | 30 / 30 / 20 / 20 | ≥ 70 / ≥ 40 |
| **SaaS** (default) | 20 / 30 / 30 / 20 | ≥ 70 / ≥ 40 |
| **Education** | 35 / 25 / 15 / 25 | ≥ 50 / ≥ 35 |

Weights are capped so the four sliders sum to ≤ 100%. Users can override presets in **Settings** or during onboarding.

**Billing-cycle caps** (`src/lib/scoring.ts`):

| Cycle | Inactivity cap | Support ticket cap |
|-------|----------------|--------------------|
| Monthly | 30 days | 5 tickets |
| Yearly | 90 days | 20 tickets |

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

**Education-only metadata (not scoring signals):** `course_subject` — friendly enrolled course name for Outreach Hub and AI emails (see [Education — OULAD dataset](#education--oulad-dataset)). On upload, `course_subject` is preferred over `company` when both are present.

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

Run from the **repo root** (`churn-old/`):

```bash
python datasets/saas/build_upload_csv.py
```

Writes **500 rows** to:

- `datasets/saas/saas-sample-customers.csv`
- `public/saas-sample-customers.csv`

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
| Login / Inactivity | 30 |
| Usage Drop | 30 |
| Support Complaints | 20 |
| Payment Delays | 20 |

Matches `INDUSTRY_DEFAULT_WEIGHTS.entertainment` in `src/lib/industry-defaults.ts`.

#### Regenerate the test CSV

```bash
python datasets/entertainment/build_upload_csv.py
```

Writes to `datasets/entertainment/entertainment-sample-customers.csv` and `public/entertainment-sample-customers.csv`.

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
| `courses.csv` | One row per course run; includes `module_presentation_length` (see below) |

#### What `module_presentation_length` means

In `courses.csv`, each row is a **course offering** (module + presentation). The column **`module_presentation_length`** is the **total length of that course run in course-days** — not a calendar date and not a student behavior signal.

| Column | Meaning | Example |
|--------|---------|---------|
| `code_module` | Course code | `AAA`, `BBB` |
| `code_presentation` | When the course ran | `2013J` (2013, October start), `2014B` (2014, February start) |
| `module_presentation_length` | How many **course days** that run lasts | `268` = the presentation spans course days `0` through ~`268` |

Example rows from `datasets/education/courses.csv`:

| code_module | code_presentation | module_presentation_length |
|-------------|-------------------|--------------------------|
| AAA | 2013J | 268 |
| BBB | 2014B | 234 |
| BBB | 2013B | 240 |

This ties to VLE activity: in `studentVle.csv`, `date` is a **course day number** (`0` = first official day, `50` = day 50 of the course). `module_presentation_length` is the **maximum day index** for that presentation — i.e. how long the module runs. It does **not** measure how active a student is.

**Attriscope use:** we do **not** upload `module_presentation_length` as a scoring input. The build script (`datasets/education/build_upload_csv.py`) reads it only to derive **`billing_cycle`** for normalization caps in `src/lib/scoring.ts`:

| `module_presentation_length` | Derived `billing_cycle` | Inactivity cap | Support ticket cap |
|------------------------------|-------------------------|----------------|--------------------|
| ≤ 210 course-days | `monthly` | 30 days | 5 |
| > 210 course-days | `yearly` | 90 days | 20 |

Most OULAD presentations are ~240–269 days, so they map to **`yearly`**. The upload CSV contains `billing_cycle`, not `module_presentation_length`.

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

**Question this answers:** Is the student **less active recently** than in the period just before that?

- **Source:** `studentVle.csv` — for each enrollment, sum all `sum_click` values in two **28-day course-day windows** ending at the snapshot (set in `datasets/education/build_upload_csv.py` as `PERIOD_DAYS = 28`, roughly four weeks per window).
- A student can have many VLE rows on the same day (one per resource); **all clicks in the window are added together**.

**The two windows** (example: snapshot = day **243**):

```
Course days:  ... 187 ---- 215 ---- 243 (snapshot)
                |←─ 28 days ─→|←─ 28 days ─→|
                PREVIOUS       CURRENT
                window         window
```

| Window | Rule | Days included (snapshot = 243) |
|--------|------|--------------------------------|
| **Current** (`current_sessions`) | `snapshot − 28 < date ≤ snapshot` | **216 → 243** |
| **Previous** (`previous_sessions`) | `snapshot − 56 < date ≤ snapshot − 28` | **188 → 215** |

**Worked example — one student, snapshot = 243:**

| Window | Total `sum_click` in that range | Column value |
|--------|----------------------------------|--------------|
| Previous (days 188–215) | 50 + 80 + 30 = **160** | `previous_sessions = 160` |
| Current (days 216–243) | 20 + 10 = **30** | `current_sessions = 30` |

Activity fell from 160 → 30 clicks — a large usage drop.

**Why 28?** Not an OULAD requirement — a practical choice: ~one month per window, two equal periods for a fair “recent vs before” comparison, and aligned with `DISENGAGED_INACTIVITY_DAYS = 28` in `src/lib/scoring.ts`. (SaaS uses 30-day windows for the same idea.)

**App logic** (matches `computeUsageDrop` in `src/lib/scoring.ts`):

```
if previous > 0:
    usage_drop = (previous - current) / previous    # 0 = no drop, 1 = 100% drop
elif current = 0 AND previous = 0 AND days_inactive > 28:
    usage_drop = 1.0    # fully disengaged (no clicks in either window)
else:
    usage_drop = 0      # can't measure drop if previous window had no activity
```

Using the worked example: `(160 − 30) / 160 = **0.8125**` → **81% usage drop**.

| `previous_sessions` | `current_sessions` | `usage_drop` | Meaning |
|---------------------|--------------------|--------------|---------|
| 100 | 100 | 0 | Steady activity |
| 100 | 50 | 0.5 | 50% drop |
| 100 | 0 | 1.0 | Stopped clicking in current window |
| 0 | 0 | 0 or 1 | 0 if still active; 1 if also `days_inactive > 28` |

**3. Support complaints → `support_complaints` (assessment struggle)**

**Question this answers:** How often did this student **struggle with coursework** (late or poor submissions)?

Mapped to SaaS **"support tickets"** — in education there are no real tickets, so we count **assessment struggle** instead.

**Source files** (`datasets/education/`):

| File | Key columns used | Role |
|------|------------------|------|
| `studentAssessment.csv` | `id_student`, `id_assessment`, `date_submitted`, `score` | What the student submitted and when |
| `assessments.csv` | `code_module`, `code_presentation`, `id_assessment`, `date` | Due date for each assessment (`date` = course day) |
| `studentInfo.csv` | `code_module`, `code_presentation`, `id_student` | Links enrollments (only students in the upload sample) |

**How files are joined** (see `derive_support_complaints` in `datasets/education/build_upload_csv.py`):

1. Merge `studentAssessment.csv` with `assessments.csv` on `id_assessment` → each submission gets its **due date** (`assessments.date`).
2. Filter to enrollments in `studentInfo.csv` (`code_module` + `code_presentation` + `id_student`).
3. Per assessment submission, flag **late** or **low score** (constants: `LATE_GRACE_DAYS = 7`, `LOW_SCORE_THRESHOLD = 40`).

**Rules per assessment:**

- **Late:** `date_submitted > due_date + 7` (7-day grace after due course day)
- **Low score:** `score < 40`
- **Struggle:** late **OR** low score

```
support_complaints = count of (late OR low_score) assessments per enrollment
```

**Worked example** (assessment IDs from `assessments.csv` for module AAA / 2013J; due = `assessments.date`, submitted = `studentAssessment.date_submitted`):

| Assessment (`id_assessment`) | Due (`assessments.date`) | Submitted (`date_submitted`) | Days after due | Score | Late? | Low score? | Struggle? |
|----------------------------|--------------------------|------------------------------|----------------|-------|-------|------------|-----------|
| 1752 | 19 | 19 | 0 | 70 | No | No | No |
| 1753 | 54 | 62 | 8 | 62 | Yes | No | **Yes** |
| 1756 | 215 | 223 | 8 | 70 | Yes | No | **Yes** |

If a student has 2 struggling assessments (e.g. 1753 and 1756), `support_complaints = 2`. That value is uploaded and normalized in the app like SaaS support ticket counts.

**4. Payment delay → `payment_delay` (withdrawal / unregistration)**

- **Source:** `studentRegistration.csv`
- **Rule:** `payment_delay = 1` if `date_unregistration` is set; otherwise `0`
- In OULAD, unregistration = student left the course. The app **floors the score at 50** (education high-risk threshold) when `payment_delay = 1` — see `src/lib/scoring.ts`.

**5. Billing cycle → `billing_cycle`** (derived from course length; scoring caps only)

- **Source:** `courses.csv` → `module_presentation_length` (see [What `module_presentation_length` means](#what-module_presentation_length-means))
- **Rule:** `monthly` if length ≤ 210 course-days, else `yearly`
- **Not a churn signal** — only adjusts inactivity/support normalization caps (same as SaaS monthly vs yearly plans)

#### Course subject → `course_subject` (education outreach only)

**Not a scoring signal.** Used for Outreach Hub labels and AI retention emails so messages can reference the student’s enrolled course (e.g. *“your Computing & IT course”*).

OULAD publishes **anonymized module codes** only (`AAA`, `BBB`, …). The build script adds **readable demo labels** — not official Open University course titles.

| Column | Example | Meaning |
|--------|---------|---------|
| `company` | `AAA · 2013J` | Technical enrollment code (module + cohort) |
| `course_subject` | `Arts & Humanities (AAA · 2013J)` | Friendly course name + code (used in UI & AI) |
| `code_module` | `AAA` | Raw OULAD module code (extra column; stored in `raw_data`) |

**Module code → friendly title** (defined in `datasets/education/build_upload_csv.py`):

| `code_module` | Friendly title |
|---------------|----------------|
| AAA | Arts & Humanities |
| BBB | Business & Management |
| CCC | Computing & IT |
| DDD | Design & Innovation |
| EEE | Engineering & Technology |
| FFF | Foundation Mathematics |
| GGG | Health & Social Care |

**App behavior:** Upload maps `course_subject` via `src/lib/column-detector.ts`. If present, it is stored as the customer’s enrollment label and passed to `/api/generate-email` and `/api/analyze` when industry is **education** (`src/lib/enrollment-context.ts`).

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

Writes to `datasets/education/education-sample-customers.csv` and `public/education-sample-customers.csv`.

Output uses `days_inactive` directly (no `last_login_at` in the CSV). Upload columns:

```csv
customer_id,name,email,company,course_subject,days_inactive,current_sessions,previous_sessions,support_complaints,payment_delay,billing_cycle,code_module,region
```

Example row:

```csv
AAA-2013J-238007,Lucas Patel,238007@education.demo,AAA · 2013J,Arts & Humanities (AAA · 2013J),16,70,252,0,0,yearly,AAA,South Region
```

Re-upload the sample CSV after pulling latest changes if you previously imported an older file without `course_subject`.

**Validate (FYP):** ground truth = `final_result == "Withdrawn"` in `studentInfo.csv`.

```bash
python datasets/education/validate_formula.py
python datasets/education/validate_formula.py --full
```

**Prediction rule:** score ≥ **50** → predicted withdrawal (matches education high-risk band and `EDUCATION_PAYMENT_FLOOR` in the app).

---

## Folder Structure

```
churn-old/                           # Git repo root = Next.js app (run npm commands here)
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
│   │   │   └── outreach/
│   │   │       ├── draft/           # GET/POST/DELETE single draft
│   │   │       └── drafts/          # GET all saved drafts (modal list)
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
│   │   ├── outreach-hub/            # EmailEditorPanel, DraftsModal, CustomerContextPanel (TipTap)
│   │   ├── data-management/
│   │   └── settings/
│   ├── lib/                         # Scoring, Gemini, outreach drafts, enrollment-context, column-detector
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

datasets/                            # Optional — Python FYP tooling (when present in repo)
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
| `/api/generate-email` | POST | AI retention email drafting (also upserts a draft row; education includes `course_subject`) |
| `/api/outreach/draft` | GET, POST, DELETE | Load, save, or delete one outreach draft |
| `/api/outreach/drafts` | GET | List all saved drafts for the current user (Outreach Hub modal) |
| `/api/send-email` | POST | Send via Resend; mark outreach email as `sent` in DB |
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
- **`src/lib/`** — pure utilities (scoring, Gemini, Supabase clients, `outreach-email.ts` draft CRUD, `enrollment-context.ts` education course labels)
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
