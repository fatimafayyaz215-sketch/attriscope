-- Migration: set default churn scoring weights to 25% each
-- Date: 2026-05-21

ALTER TABLE user_settings
  ALTER COLUMN weight_inactivity SET DEFAULT 25,
  ALTER COLUMN weight_usage SET DEFAULT 25,
  ALTER COLUMN weight_support SET DEFAULT 25,
  ALTER COLUMN weight_payment SET DEFAULT 25;

-- Optional data migration: align existing users who still have legacy defaults.
-- This updates rows that exactly match the old default profile (30/25/25/20)
-- so customized user settings are preserved.
UPDATE user_settings
SET
  weight_inactivity = 25,
  weight_usage = 25,
  weight_support = 25,
  weight_payment = 25,
  updated_at = NOW()
WHERE
  weight_inactivity = 30
  AND weight_usage = 25
  AND weight_support = 25
  AND weight_payment = 20;
