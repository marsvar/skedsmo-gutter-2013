ALTER TABLE sessions
  ADD COLUMN IF NOT EXISTS rondo_duration      integer NOT NULL DEFAULT 10,
  ADD COLUMN IF NOT EXISTS sjef_duration       integer NOT NULL DEFAULT 10,
  ADD COLUMN IF NOT EXISTS tema_duration       integer NOT NULL DEFAULT 30,
  ADD COLUMN IF NOT EXISTS spill_duration      integer NOT NULL DEFAULT 35,
  ADD COLUMN IF NOT EXISTS oppsummering_duration integer NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS rrr_duration        integer NOT NULL DEFAULT 20;
