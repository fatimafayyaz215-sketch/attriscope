# Attriscope — Team Codebase Guide

> **Who is this for?** Teammates who need to understand *what the project does* and *what each folder/file is for* — even with little or no coding background.
>
> **For setup & deployment**, see [README.md](./README.md).

**Production app:** https://churn-prediction-navy.vercel.app

---

## Table of Contents

1. [What Attriscope Does (30 seconds)](#1-what-attriscope-does-30-seconds)
2. [The Big Picture — Building Analogy](#2-the-big-picture--building-analogy)
3. [Two Layers in the Repository](#3-two-layers-in-the-repository)
4. [How Data Flows (User Journey)](#4-how-data-flows-user-journey)
5. [App Folder Map](#5-app-folder-map)
6. [Every Page (What Users See)](#6-every-page-what-users-see)
7. [API Routes (Hidden Backend Work)](#7-api-routes-hidden-backend-work)
8. [Features Folder (Product Screens)](#8-features-folder-product-screens)
9. [Shared Components (UI Shell)](#9-shared-components-ui-shell)
10. [Lib Folder (Brains & Logic)](#10-lib-folder-brains--logic)
11. [Store, Services & Types](#11-store-services--types)
12. [Supabase (Database & Auth Emails)](#12-supabase-database--auth-emails)
13. [Datasets Folder (FYP Research Tools)](#13-datasets-folder-fyp-research-tools)
14. [The Scoring Formula (Simple)](#14-the-scoring-formula-simple)
15. [Config Files at App Root](#15-config-files-at-app-root)
16. [Glossary](#16-glossary)
17. [Common Questions](#17-common-questions)

---

## 1. What Attriscope Does (30 seconds)

**Attriscope** helps businesses spot customers who might leave (*churn*) before they actually leave.

| Step | What happens |
|------|----------------|
| 1 | User signs up and logs in |
| 2 | Picks an industry (SaaS, Entertainment, or Education) |
| 3 | Uploads a spreadsheet (CSV) of customers |
| 4 | App scores each customer **0–100** on 4 risk signals |
| 5 | Dashboard shows who is high risk |
| 6 | User can get AI help to understand *why* and draft retention emails |

**Core workflow:**

```
Sign up → Onboarding → Upload CSV → Dashboard → Risk Analysis → Outreach Hub
```

---

## 2. The Big Picture — Building Analogy

| Real-world part | What it is in code |
|-----------------|-------------------|
| **Front door & lobby** | Landing page, login, register |
| **Security guard** | `src/proxy.ts` — checks login before private pages |
| **Office rooms** | Dashboard, Risk Analysis, Outreach Hub, etc. |
| **Filing cabinet** | Supabase database (customers, settings, emails) |
| **Back office** | `src/app/api/` — server work behind the scenes |
| **Recipe book** | `src/lib/scoring.ts` — the risk score math |
| **Interior design** | `globals.css`, Tailwind — colors and layout |
| **Training manuals** | `datasets/` — Python scripts to build test spreadsheets |

---

## 3. Two Layers in the Repository

When you clone the repo, you get **two main areas**:

```
churn-old/                          ← repo root (example clone path)
│
├── churn-prediction/               ← THE WEB APP (90% of what matters)
│   ├── src/                        ← all application code
│   ├── public/                     ← sample CSVs, images
│   ├── supabase/                   ← database blueprint + email templates
│   └── package.json                ← list of libraries the app uses
│
└── datasets/                       ← Python tools (FYP / research only)
    ├── saas/
    ├── entertainment/
    └── education/
```

| Area | Purpose |
|------|---------|
| **`churn-prediction/`** | The live website users interact with |
| **`datasets/`** | Builds and validates sample CSV files that get uploaded into the app |

---

## 4. How Data Flows (User Journey)

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│ User signs  │────▶│ Onboarding   │────▶│ Upload CSV      │
│ up / logs in│     │ industry +   │     │ Data Management │
└─────────────┘     │ weights      │     └────────┬────────┘
                    └──────────────┘              │
                                                  ▼
                    ┌──────────────────────────────────────┐
                    │  API /upload scores each row         │
                    │  Saves to Supabase `customers` table   │
                    └──────────────────┬───────────────────┘
                                       │
           ┌───────────────────────────┼───────────────────────────┐
           ▼                           ▼                           ▼
    ┌─────────────┐           ┌───────────────┐           ┌──────────────┐
    │ Dashboard   │           │ Risk Analysis │           │ Outreach Hub │
    │ charts/KPIs │           │ filters + AI  │           │ email drafts │
    └─────────────┘           └───────────────┘           └──────────────┘
```

**Important distinction:**

| Storage | Where | Lifespan | Purpose |
|---------|-------|----------|---------|
| **Supabase (database)** | Cloud | Permanent | Real customer data, settings, emails |
| **churn-store (browser)** | User's tab | Until page refresh | Fast UI memory (selected customer, refresh signals) |

---

## 5. App Folder Map

Everything inside `churn-prediction/`:

```
churn-prediction/
├── public/                 Static files (sample CSVs, icons)
├── supabase/               Database SQL + auth email HTML
├── src/
│   ├── app/                Pages (URLs) + API endpoints
│   ├── components/         Reusable UI (sidebar, buttons, chat)
│   ├── features/           One folder per product feature
│   ├── lib/                Logic (scoring, AI, helpers)
│   ├── services/           Login/logout wrappers
│   ├── store/              Shared browser memory (Zustand)
│   ├── types/              Data shape definitions
│   └── proxy.ts            Security guard (session + redirects)
├── .env.example            Template for secret keys
├── package.json            Dependencies and npm scripts
└── README.md               Developer setup guide
```

### Architecture pattern (how code is organized)

| Folder | Rule |
|--------|------|
| `src/app/` | **URLs** — thin pages that import feature components |
| `src/features/` | **Product areas** — real screen content grouped by feature |
| `src/components/` | **Shared UI** — sidebar, top bar, buttons used on many pages |
| `src/lib/` | **Pure logic** — no UI, just calculations and helpers |
| `src/app/api/` | **Backend** — save data, run formula, call AI |

---

## 6. Every Page (What Users See)

In Next.js, **folders = website addresses**. A file named `page.tsx` is what the user sees.

### Public pages (no login) — `src/app/(public)/`

The `(public)` part is invisible in the URL — it's just an organizer.

| URL | File | What the user sees |
|-----|------|-------------------|
| `/` | `(public)/page.tsx` | Marketing landing page |
| `/login` | `(public)/login/page.tsx` | Sign in (email or Google) |
| `/register` | `(public)/register/page.tsx` | Create account |
| `/forgot-password` | `(public)/forgot-password/page.tsx` | Request password reset |
| `/reset-password` | `(public)/reset-password/page.tsx` | Set new password |

**Layout:** `(public)/layout.tsx` adds the top navigation header.

### Onboarding — `src/app/onboarding/`

| URL | Purpose |
|-----|---------|
| `/onboarding` | Step 1: Pick industry |
| `/onboarding/step-2` | Step 2: Adjust scoring weights |
| `/onboarding/step-3` | Step 3: Point user to upload data |

### Dashboard app (login required) — `src/app/(dashboard)/`

| URL | Purpose |
|-----|---------|
| `/dashboard` | KPIs, charts, high-risk alerts |
| `/risk-analysis` | Search/filter customers, AI explanations |
| `/outreach-hub` | Draft retention emails |
| `/data-management` | Upload CSV, map columns, delete data |
| `/settings` | Industry, weights, formula transparency |

**Layout:** `(dashboard)/layout.tsx` wraps all five screens in the same sidebar shell.

### Special pages

| File | Purpose |
|------|---------|
| `src/app/layout.tsx` | Root wrapper (fonts, page title) |
| `src/app/globals.css` | Brand colors and design tokens |
| `src/app/loading.tsx` | Loading skeleton |
| `src/app/error.tsx` | Error screen if something crashes |
| `src/app/not-found.tsx` | 404 page |
| `src/app/auth/callback/route.ts` | Handles Google login & password-reset links (not a visible page) |
| `src/proxy.ts` | Security guard — redirects to login if not authenticated |

---

## 7. API Routes (Hidden Backend Work)

These live in `src/app/api/`. The UI calls them with `fetch("/api/...")`.

Think of APIs as **waiters**: the screen orders something, the API goes to the kitchen (database/AI) and brings back the result.

| API | What it does |
|-----|--------------|
| `POST /api/upload` | Read CSV → score each row → save to database |
| `GET /api/customers` | Fetch customer list for logged-in user |
| `DELETE /api/customers` | Delete all imported customer data |
| `GET /api/stats` | Numbers for dashboard charts |
| `POST /api/analyze` | AI explanation: "Why is this customer risky?" |
| `POST /api/generate-email` | AI drafts a retention email |
| `POST /api/send-email` | Mark email as "sent" in database *(does not send via Gmail)* |
| `GET /api/settings` | Read user's industry and weights |
| `POST /api/settings` | Save industry and weights |
| `POST /api/settings/recalculate` | Re-score all customers after weight change |
| `POST /api/app-assistant` | Powers the sidebar AI chat |
| `POST /api/advisor/context` | Tells AI which page user is on |
| `GET /api/status` | Health check |

---

## 8. Features Folder (Product Screens)

Each folder = one product area. UI lives here, not scattered randomly.

```
src/features/
├── auth/              Login, register, password reset forms
├── landing/           Marketing homepage
├── onboarding/        Industry cards, weight sliders
├── dashboard/         Stat cards, charts, alerts table
├── risk-analysis/     Customer table, filters, AI panel
├── outreach-hub/      Email editor, customer context
├── data-management/   CSV upload wizard, delete data
└── settings/          Industry picker, weights, formula display
```

| Feature | Key components | What they do |
|---------|----------------|--------------|
| **auth** | `LoginForm`, `RegisterForm`, `ResetPasswordForm` | Sign-in screens |
| **landing** | `LandingPage` | Sales page before login |
| **onboarding** | `IndustryCard`, `WeightSlider` | First-time setup |
| **dashboard** | `StatCards`, `RiskDistributionChart`, `EngagementTrendChart`, `HighPriorityAlertsTable` | Home screen after login |
| **risk-analysis** | `RiskWorkspace`, `RiskIntelligencePanel` | Deep dive + AI "why" |
| **outreach-hub** | `EmailEditorPanel`, `CustomerContextPanel` | Write emails to save customers |
| **data-management** | `DataImportWorkspace`, `DataGuidancePanel`, `DeleteImportedDataButton` | Import spreadsheet |
| **settings** | `IndustrySelector`, `WeightTuning`, `FormulaTransparency`, `SettingsFooter` | Tune scoring |

**Pattern:** `src/app/.../page.tsx` is thin — it mostly imports from `src/features/...`.

---

## 9. Shared Components (UI Shell)

`src/components/` — LEGO bricks used on many pages.

### Layout (`src/components/layout/`)

| File | Purpose |
|------|---------|
| `DashboardShell.tsx` | Frame: sidebar + top bar + main area + AI chat |
| `Sidebar.tsx` | Left menu (Dashboard, Risk Analysis, etc.) |
| `TopBar.tsx` | Page title, search, user menu |
| `PublicHeader.tsx` | Header on public/marketing pages |
| `AdvisorChatPanel.tsx` | Floating AI assistant chat |
| `advisor-chat-context.tsx` | Open/close state for the chat |
| `AdvisorMessageBody.tsx` | Renders AI messages (bold, bullets) |

### UI primitives (`src/components/ui/`)

| File | Purpose |
|------|---------|
| `Button.tsx` | Reusable button |
| `Input.tsx` | Reusable text input |

---

## 10. Lib Folder (Brains & Logic)

`src/lib/` — pure logic, no visible UI.

| File | Purpose | Analogy |
|------|---------|---------|
| **`scoring.ts`** | Turns 4 signals into 0–100 score + High/Medium/Low | The calculator |
| **`industry-defaults.ts`** | Default weights & risk thresholds per industry | Preset recipes |
| **`column-detector.ts`** | Auto-maps CSV columns (name, email, sessions…) | Spreadsheet translator |
| **`inactivity.ts`** | Converts "last login date" → "days inactive" | Date math |
| **`billing-cycle.ts`** | Reads monthly vs yearly from CSV | Billing parser |
| **`customer-signals.ts`** | Finds strongest risk signal per customer | "Main red flag" |
| **`gemini.ts`** | Connects to Google AI (optional) | AI connector |
| **`advisor-prompts.ts`** | Instructions for the AI assistant | AI personality |
| **`advisor-events.ts`** | Events for advisor context | Screen awareness |
| **`brand.ts`** | Brand name constants | Naming |
| **`industry.ts`** | Industry display helpers | Labels |
| **`utils.ts`** | Small shared helpers | Misc tools |
| **`supabase/client.ts`** | Database connection (browser) | Frontend DB key |
| **`supabase/server.ts`** | Database connection (API routes) | Backend DB key |

> `api-client.ts` is unused legacy code — the app calls `/api/...` directly.

---

## 11. Store, Services & Types

### `src/store/churn-store.ts` — Shared browser memory

Uses **Zustand** so multiple screens share data without passing props everywhere.

| What it stores | Why |
|----------------|-----|
| `customers` | Customer list cached for Risk Analysis & Outreach |
| `selectedCustomerId` | Which customer you clicked — shared across pages |
| `weights` / `industry` | Settings sliders stay in sync across components |
| `dataVersion` | Counter — when it changes, dashboard refetches charts |

**Real example — Dashboard → Outreach:**

1. User clicks **Intervene** on a high-risk customer.
2. Store saves `selectedCustomerId`.
3. App opens Outreach Hub — email editor knows which customer to use.

**Real example — After CSV upload:**

1. Upload saves to Supabase.
2. Store calls `bumpDataVersion()`.
3. Dashboard charts see the change and refresh.

> **Not the database.** Refreshing the browser clears most store data. Supabase keeps the real records.

### `src/services/auth.service.ts`

Wraps all login actions: email login, register, Google OAuth, forgot password, logout.

### `src/types/`

| File | Purpose |
|------|---------|
| `auth.ts` | Shapes for login/register data (actively used) |
| `index.ts` | Older unused types (can ignore) |

---

## 12. Supabase (Database & Auth Emails)

### Database tables (`supabase/schema.sql`)

Run once in Supabase SQL Editor to create tables.

| Table | Stores | Example |
|-------|--------|---------|
| `customers` | Each imported customer + risk score | "John Doe, score 78, high risk" |
| `user_settings` | Industry + weight sliders | "SaaS, usage 45%, payment 30%…" |
| `outreach_emails` | Drafted/sent retention emails | "Email to John, status: sent" |

**Security:** Row Level Security (RLS) — each user only sees their own data.

### Email templates (`supabase/templates/`)

| File | Supabase dashboard location |
|------|----------------------------|
| `confirm-signup.html` | Authentication → Email Templates → Confirm signup |
| `reset-password.html` | Reset password |
| `magic-link.html` | Magic link |
| `email-change.html` | Change email |
| `invite.html` | Invite user |

**These are NOT auto-linked from your laptop.**

1. Open the `.html` file in the repo.
2. Copy all content.
3. Paste into Supabase dashboard → **Authentication → Email Templates** → Save.

Do this once per Supabase project. If you skip it, auth still works — emails just look generic.

**Keep placeholders like `{{ .ConfirmationURL }}`** — Supabase replaces them with real links.

### Environment variables (`.env.local`)

| Variable | Required | Purpose |
|----------|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase → **Settings → General** → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase → **Settings → API Keys** → **Publishable key** → copy (`sb_publishable_...`) |
| `GEMINI_API_KEY` | No | Google AI (emails, explanations, chat) |

---

## 13. Datasets Folder (FYP Research Tools)

Outside the web app — Python scripts for your thesis validation.

```
datasets/
├── saas/           RavenStack data → saas-sample-customers.csv
├── entertainment/  Netflix-style data → entertainment-sample-customers.csv
└── education/      OULAD university data → education-sample-customers.csv
```

Each folder has:

| Script | Purpose |
|--------|---------|
| `build_upload_csv.py` | Creates the CSV file users upload in the app |
| `validate_formula.py` | Compares predictions vs real churn/withdrawal labels |

Output CSVs are copied to `churn-prediction/public/` for download in Data Management.

---

## 14. The Scoring Formula (Simple)

Each customer gets a **Risk Score 0–100** from four signals:

| # | Signal | What it measures |
|---|--------|------------------|
| 1 | **Inactivity** | Days since last login / activity |
| 2 | **Usage drop** | Sessions dropped vs previous period |
| 3 | **Support complaints** | Number of support tickets |
| 4 | **Payment delay** | 0 = OK, 1 = delayed / at risk |

**Formula location:** `src/lib/scoring.ts`  
**Industry presets:** `src/lib/industry-defaults.ts`

### Default weights by industry

| Industry | Inactivity | Usage | Support | Payment | High risk if score ≥ |
|----------|------------|-------|---------|---------|----------------------|
| **SaaS** | 10% | 45% | 15% | 30% | 70 |
| **Entertainment** | 35% | 30% | 20% | 15% | 70 |
| **Education** | 35% | 25% | 15% | 25% | 50 |

Users can override weights in **Settings** or during onboarding.

### Sample CSV files (`public/`)

| File | Industry |
|------|----------|
| `saas-sample-customers.csv` | SaaS |
| `entertainment-sample-customers.csv` | Entertainment / streaming |
| `education-sample-customers.csv` | Education |

---

## 15. Config Files at App Root

| File | Purpose |
|------|---------|
| `package.json` | List of libraries + npm commands (`dev`, `build`, `lint`) |
| `package-lock.json` | Locked library versions (auto-generated) |
| `next.config.ts` | Next.js settings (e.g. allowed image domains) |
| `tsconfig.json` | TypeScript rules |
| `eslint.config.mjs` | Code quality checker |
| `postcss.config.mjs` | Tailwind CSS pipeline |
| `.env.example` | Template for secret keys |
| `.env.local` | Your real keys — **never commit or share** |
| `README.md` | Full developer setup guide |
| `TEAM_CODEBASE_GUIDE.md` | This document |

### Useful commands (developers)

```bash
cd churn-prediction
npm install      # install dependencies (first time)
npm run dev      # start local site at http://localhost:3000
npm run build    # test production build
npm run lint     # check code quality
```

---

## 16. Glossary

| Term | Plain English |
|------|---------------|
| **Frontend** | What users see and click (pages, buttons) |
| **Backend / API** | Hidden server work (save data, score, call AI) |
| **Database** | Permanent cloud storage (Supabase) |
| **CSV** | Spreadsheet file (Excel-style) |
| **Component** | One piece of UI (a form, chart, sidebar) |
| **Route / Page** | A URL like `/dashboard` |
| **Session** | Proof you're logged in |
| **RLS** | Database rule: you only see your own data |
| **Gemini** | Google's AI — optional |
| **Store (Zustand)** | Short-term browser memory while clicking around |
| **Proxy** | Security check before opening a page |
| **Feature folder** | Code grouped by product area (dashboard, auth, etc.) |

---

## 17. Common Questions

**Where is the churn formula?**  
→ `src/lib/scoring.ts` and `src/lib/industry-defaults.ts`

**Where do we upload data?**  
→ Data Management page → `src/app/api/upload/route.ts`

**Does the app actually send emails?**  
→ It drafts emails with AI and records them as "sent" in the database. It does **not** connect to Gmail/SMTP yet.

**What if Gemini API key is missing?**  
→ App still works. AI features use simpler fallback text.

**What's the difference between `app` and `features`?**  
→ `app` = URLs (addresses). `features` = the actual screen content.

**Are Supabase email templates automatic?**  
→ No. Copy from `supabase/templates/` into Supabase dashboard manually.

**Why three industries?**  
→ Different businesses churn for different reasons, so scoring weights differ.

**What is `churn-store.ts` for?**  
→ Shared browser memory: selected customer, refresh signals, settings UI sync. Not the database.

**What are the 8 most important files to read?**

1. `README.md` — setup
2. `src/lib/scoring.ts` — formula
3. `src/lib/industry-defaults.ts` — industry presets
4. `src/app/api/upload/route.ts` — how data enters
5. `src/store/churn-store.ts` — UI shared memory
6. `src/components/layout/Sidebar.tsx` — navigation map
7. `supabase/schema.sql` — what's stored permanently
8. `src/proxy.ts` — who can access what

---

## Quick Reference — Five Main Screens

| Screen | URL | One-line purpose |
|--------|-----|------------------|
| Dashboard | `/dashboard` | Overview of risk across all customers |
| Risk Analysis | `/risk-analysis` | Find and understand at-risk customers |
| Outreach Hub | `/outreach-hub` | Draft retention emails |
| Data Management | `/data-management` | Import or delete customer data |
| System Settings | `/settings` | Industry and scoring weights |

---

*Last updated for Attriscope churn-prediction codebase. For technical setup, see [README.md](./README.md).*
