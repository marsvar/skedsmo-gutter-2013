ALTER TABLE seasons ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE seasons ADD COLUMN IF NOT EXISTS skip_periods JSONB NOT NULL DEFAULT '[]';
ALTER TABLE blocks ADD COLUMN IF NOT EXISTS start_date TEXT;
ALTER TABLE blocks ADD COLUMN IF NOT EXISTS end_date TEXT;

-- Activate the current season (highest year) only if none is active yet
UPDATE seasons SET is_active = TRUE
WHERE id = (SELECT id FROM seasons ORDER BY year DESC LIMIT 1)
  AND NOT EXISTS (SELECT 1 FROM seasons WHERE is_active = TRUE);
