-- Migration 005: teaching field + self-service researcher profiles
-- Context: client meeting 2026-06-10 (Marwa). Researchers self-register (option 2)
-- and a "teaching" rubric is added to the profile.

-- Teaching rubric: does the researcher give process mining courses?
ALTER TABLE researchers ADD COLUMN IF NOT EXISTS teaches BOOLEAN DEFAULT false;
ALTER TABLE researchers ADD COLUMN IF NOT EXISTS teaching_details TEXT DEFAULT '';

-- (future ②) origin flag to split the static/international vs dynamic/french views.
-- Self-created profiles (user_id NOT NULL) default to 'fr'; imported ones stay 'international'.
ALTER TABLE researchers ADD COLUMN IF NOT EXISTS origin TEXT DEFAULT 'international'
  CHECK (origin IN ('international', 'fr'));
