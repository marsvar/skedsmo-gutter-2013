-- drizzle/0003_training_days.sql
ALTER TABLE seasons
  ADD COLUMN IF NOT EXISTS default_training_days jsonb NOT NULL DEFAULT '["monday","tuesday","thursday","saturday"]';

ALTER TABLE blocks
  ADD COLUMN IF NOT EXISTS training_days jsonb;
-- null means "use season default"
