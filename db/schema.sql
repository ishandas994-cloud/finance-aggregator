-- Run this once against your Neon database (Neon SQL editor or psql)

CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS accounts (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER REFERENCES users(id) ON DELETE CASCADE,
  bank_name   TEXT NOT NULL,
  account_type TEXT NOT NULL DEFAULT 'checking', -- checking | savings | credit_card
  last_four   TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS transactions (
  id            SERIAL PRIMARY KEY,
  account_id    INTEGER REFERENCES accounts(id) ON DELETE CASCADE,
  user_id       INTEGER REFERENCES users(id) ON DELETE CASCADE,
  merchant      TEXT NOT NULL,
  amount        NUMERIC(12,2) NOT NULL,
  category      TEXT NOT NULL DEFAULT 'uncategorized',
  status        TEXT NOT NULL DEFAULT 'processed', -- queued | processed | flagged
  occurred_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_transactions_user_category
  ON transactions(user_id, category);

CREATE TABLE IF NOT EXISTS anomalies (
  id             SERIAL PRIMARY KEY,
  transaction_id INTEGER REFERENCES tr  ansactions(id) ON DELETE CASCADE,
  user_id        INTEGER REFERENCES users(id) ON DELETE CASCADE,
  reason         TEXT NOT NULL,
  severity       TEXT NOT NULL DEFAULT 'medium', -- low | medium | high
  detected_at    TIMESTAMPTZ DEFAULT now(),
  resolved       BOOLEAN DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_anomalies_user ON anomalies(user_id);