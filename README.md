# Churn Prediction — Next.js Application

> A production-ready Next.js application using the **App Router**, TypeScript, Tailwind CSS v4, and ESLint.

---

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Getting Started](#getting-started)
4. [Folder Structure](#folder-structure)
5. [CSS Variables & Design Tokens](#css-variables--design-tokens)
6. [Naming Conventions](#naming-conventions)
7. [Best Practices](#best-practices)
8. [Scripts](#scripts)

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

- **Authentication Flow**: [Login](http://localhost:3000/login), [Registration](http://localhost:3000/register), and [Forgot Password](http://localhost:3000/forgot-password) screens with modular split-panel designs.
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
| Framework   | Next.js 15 (App Router)         |
| Language    | TypeScript                      |
| Styling     | Tailwind CSS v4 + CSS Variables |
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
