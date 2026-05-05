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
- **Middleware** — edge-runtime logic (auth, redirects, A/B tests) via `middleware.ts`.

---

## Implemented Features

- **Authentication Flow (`/(auth)`)**: Login, Registration, and Forgot Password screens with modular split-panel designs.
- **Onboarding Wizard (`/onboarding`)**: A 3-step configuration flow for industry selection, weight calibration, and data connection.
- **Dashboard Overview (`/(dashboard)`)**: The main application shell featuring a persistent sidebar, top navigation, and custom dashboard widgets (KPI Cards, Risk Distribution Chart, Engagement Trend Chart, and High-Priority Alerts Table).

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
│   │   ├── ui/                 # Primitive components (Button, Input, Card...)
│   │   └── charts/             # Domain-specific chart components
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
| `middleware.ts` | Runs before requests at the edge                             |

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

## Best Practices

### Server vs Client Components

- **Default to Server Components** — they ship zero JS to the browser.
- Add `"use client"` **only** when you need browser APIs, event handlers, or client state.
- Keep the client boundary as deep in the component tree as possible.

### Data Fetching

```ts
// Preferred — async Server Component
export default async function Page() {
  const res = await fetch('https://api.example.com/data', {
    next: { revalidate: 60 }, // ISR: revalidate every 60 s
  });
  return <Dashboard data={await res.json()} />;
}
```

| Cache option              | Rendering strategy          |
|---------------------------|-----------------------------|
| `cache: 'no-store'`       | SSR (always fresh)          |
| `next: { revalidate: N }` | ISR (time-based revalidate) |
| *(omit cache)*            | SSG (build-time static)     |

### Environment Variables

| Prefix         | Accessible in          |
|----------------|------------------------|
| `NEXT_PUBLIC_` | Browser **and** server |
| *(no prefix)*  | Server only            |

Never expose secrets with `NEXT_PUBLIC_`.

### Performance

- Use `next/image` for all images — automatic WebP conversion + lazy loading.
- Use `next/font` to self-host fonts and eliminate layout shift.
- Use `next/link` for client-side navigation (prefetching built-in).
- Load heavy third-party scripts with `next/script` and `strategy="lazyOnload"`.

### Security

- Validate all user input on API routes using a schema library (e.g. Zod).
- Store secrets in `.env.local` — never commit this file.
- Set security headers in `next.config.ts` via the `headers()` export.

---

## Scripts

```bash
npm run dev      # Start dev server at http://localhost:3000
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```
