-- Sprint 21: DM Engine (v2 — external API service model)
-- Run: psql -U ghostpost -d ghostpost -f 015-dm-engine.sql

-- ─────────────────────────────────────────────────────────────────────────────
-- Drop v1 tables if they exist from an earlier sprint run
-- (safe to run multiple times — all IF EXISTS)
-- ─────────────────────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS dm_logs      CASCADE;
DROP TABLE IF EXISTS dm_targets   CASCADE;
DROP TABLE IF EXISTS dm_rate_limits CASCADE;
DROP TABLE IF EXISTS dm_campaigns CASCADE;

-- ─────────────────────────────────────────────────────────────────────────────
-- instagram_accounts
-- Registered Instagram sessions available for sending DMs.
-- cookies column stores the Playwright cookie JSON, AES-256 encrypted at rest
-- (encrypted by the app layer using COOKIE_ENCRYPTION_KEY env var before INSERT).
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS instagram_accounts (
  id            SERIAL PRIMARY KEY,
  username      TEXT NOT NULL UNIQUE,
  display_name  TEXT,
  cookies       TEXT,                        -- AES-256 encrypted JSON cookie array
  status        TEXT NOT NULL DEFAULT 'active',
                                             -- active | suspended | needs_reauth
  daily_limit   INT  NOT NULL DEFAULT 50,
  sent_today    INT  NOT NULL DEFAULT 0,
  last_reset    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_ig_account_status CHECK (status IN ('active','suspended','needs_reauth'))
);

CREATE INDEX IF NOT EXISTS idx_ig_accounts_status ON instagram_accounts(status);

-- ─────────────────────────────────────────────────────────────────────────────
-- dm_jobs
-- Every individual DM request queued via POST /api/dm/send.
-- job_id is a UUID v4 generated at insert time and returned to the caller.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS dm_jobs (
  id                SERIAL PRIMARY KEY,
  job_id            TEXT NOT NULL UNIQUE,     -- UUID v4
  from_account      TEXT REFERENCES instagram_accounts(username) ON DELETE SET NULL,
  to_handle         TEXT NOT NULL,            -- Instagram username, no @
  message           TEXT NOT NULL,
  campaign_id       TEXT,                     -- Opaque string passed from caller (e.g. ReeveOS)
  lead_id           TEXT,                     -- Opaque string passed from caller
  status            TEXT NOT NULL DEFAULT 'queued',
                                              -- queued | sending | sent | failed | rate_limited
  error             TEXT,
  sent_at           TIMESTAMPTZ,
  queued_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  webhook_url       TEXT,                     -- POST'd to on completion/failure
  webhook_delivered BOOLEAN NOT NULL DEFAULT FALSE,
  webhook_attempts  INT NOT NULL DEFAULT 0,
  duration_ms       INT,                      -- Playwright round-trip time

  CONSTRAINT chk_dm_job_status CHECK (status IN ('queued','sending','sent','failed','rate_limited'))
);

CREATE INDEX IF NOT EXISTS idx_dm_jobs_status     ON dm_jobs(status);
CREATE INDEX IF NOT EXISTS idx_dm_jobs_campaign   ON dm_jobs(campaign_id);
CREATE INDEX IF NOT EXISTS idx_dm_jobs_from       ON dm_jobs(from_account);
CREATE INDEX IF NOT EXISTS idx_dm_jobs_queued_at  ON dm_jobs(queued_at DESC);

-- ─────────────────────────────────────────────────────────────────────────────
-- Helper: reset sent_today counters for all accounts at UTC midnight.
-- Call this via a pg_cron job or from the Node process at startup each day.
--   SELECT cron.schedule('reset-ig-daily', '0 0 * * *',
--     $$UPDATE instagram_accounts SET sent_today = 0, last_reset = NOW()$$);
-- ─────────────────────────────────────────────────────────────────────────────
