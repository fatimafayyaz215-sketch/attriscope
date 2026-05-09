-- ============================================================
-- ChurnGuard AI — Supabase Schema
-- Run this in the Supabase SQL Editor to set up the database.
-- ============================================================

-- Customers table: stores imported + scored customer records
CREATE TABLE IF NOT EXISTS customers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name            TEXT NOT NULL DEFAULT '',
  email           TEXT NOT NULL DEFAULT '',
  company         TEXT NOT NULL DEFAULT '',
  industry        TEXT NOT NULL DEFAULT 'saas',
  last_login_at   TIMESTAMPTZ,
  days_inactive   INTEGER NOT NULL DEFAULT 0,
  usage_drop      NUMERIC(6,4) NOT NULL DEFAULT 0,
  support_complaints INTEGER NOT NULL DEFAULT 0,
  payment_delay   INTEGER NOT NULL DEFAULT 0,
  risk_score      INTEGER NOT NULL DEFAULT 0,
  risk_level      TEXT NOT NULL DEFAULT 'low',
  ai_explanation  TEXT,
  raw_data        JSONB,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User settings: scoring weights + industry per user
CREATE TABLE IF NOT EXISTS user_settings (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  industry          TEXT NOT NULL DEFAULT 'saas',
  weight_inactivity INTEGER NOT NULL DEFAULT 30,
  weight_usage      INTEGER NOT NULL DEFAULT 25,
  weight_support    INTEGER NOT NULL DEFAULT 25,
  weight_payment    INTEGER NOT NULL DEFAULT 20,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Outreach emails: drafted / sent retention emails
CREATE TABLE IF NOT EXISTS outreach_emails (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  to_email    TEXT NOT NULL DEFAULT '',
  subject     TEXT NOT NULL DEFAULT '',
  body        TEXT NOT NULL DEFAULT '',
  status      TEXT NOT NULL DEFAULT 'draft',  -- draft | sent
  sent_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Indexes ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_customers_user_id    ON customers(user_id);
CREATE INDEX IF NOT EXISTS idx_customers_risk_level ON customers(risk_level);
CREATE INDEX IF NOT EXISTS idx_emails_customer_id   ON outreach_emails(customer_id);

-- ── Row-Level Security ────────────────────────────────────────
ALTER TABLE customers        ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings    ENABLE ROW LEVEL SECURITY;
ALTER TABLE outreach_emails  ENABLE ROW LEVEL SECURITY;

-- customers
CREATE POLICY "customers_select" ON customers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "customers_insert" ON customers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "customers_update" ON customers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "customers_delete" ON customers FOR DELETE USING (auth.uid() = user_id);

-- user_settings
CREATE POLICY "settings_select" ON user_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "settings_insert" ON user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "settings_update" ON user_settings FOR UPDATE USING (auth.uid() = user_id);

-- outreach_emails
CREATE POLICY "emails_select" ON outreach_emails FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "emails_insert" ON outreach_emails FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "emails_update" ON outreach_emails FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "emails_delete" ON outreach_emails FOR DELETE USING (auth.uid() = user_id);
