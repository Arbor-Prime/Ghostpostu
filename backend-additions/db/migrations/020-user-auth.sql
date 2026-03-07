-- Sprint 20: User authentication
-- Run: psql -U ghostpost -d ghostpost -f 020-user-auth.sql

ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_complete BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- Backfill existing user 1 as onboarding complete (has voice profile already)
UPDATE users SET onboarding_complete = TRUE WHERE id = 1;

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
