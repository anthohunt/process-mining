-- CartoPM — remove dev seed data from a deployed Supabase project.
--
-- Run this in the Supabase SQL editor (production project) once, to purge the
-- synthetic Marie Dupont / Jean Martin / Sophie Leclerc / Ahmed Benali /
-- Claire Fontaine researchers and their related rows. Idempotent — safe to
-- re-run.
--
-- The fixtures all use well-known UUID prefixes:
--   clusters:    11111111-0000-0000-0000-00000000000X
--   researchers: 22222222-0000-0000-0000-00000000000X
--
-- Real records created via the app UI will have random UUIDs and are untouched.

BEGIN;

-- 1. Similarity scores referencing seed researchers
DELETE FROM similarity_scores
WHERE researcher_a::text LIKE '22222222-0000-0000-0000-%'
   OR researcher_b::text LIKE '22222222-0000-0000-0000-%';

-- 2. Publications attached to seed researchers
DELETE FROM publications
WHERE researcher_id::text LIKE '22222222-0000-0000-0000-%';

-- 3. Audit logs authored by the seed identities (match on user_name since the
--    seed inserts didn't set user_id)
DELETE FROM audit_logs
WHERE user_name IN (
  'Marie Dupont',
  'Jean Martin',
  'Sophie Leclerc',
  'Ahmed Benali',
  'Claire Fontaine'
);

-- 4. Researchers themselves
DELETE FROM researchers
WHERE id::text LIKE '22222222-0000-0000-0000-%';

-- 5. Seed clusters (only if no real researchers reference them)
DELETE FROM clusters c
WHERE c.id::text LIKE '11111111-0000-0000-0000-%'
  AND NOT EXISTS (
    SELECT 1 FROM researchers r WHERE r.cluster_id = c.id
  );

COMMIT;

-- Sanity check — these should all be 0 after the cleanup.
SELECT 'researchers_left' AS scope, count(*) FROM researchers WHERE id::text LIKE '22222222-0000-0000-0000-%'
UNION ALL
SELECT 'publications_left', count(*) FROM publications WHERE researcher_id::text LIKE '22222222-0000-0000-0000-%'
UNION ALL
SELECT 'similarity_left', count(*) FROM similarity_scores WHERE researcher_a::text LIKE '22222222-0000-0000-0000-%' OR researcher_b::text LIKE '22222222-0000-0000-0000-%'
UNION ALL
SELECT 'seed_audit_left', count(*) FROM audit_logs WHERE user_name IN ('Marie Dupont','Jean Martin','Sophie Leclerc','Ahmed Benali','Claire Fontaine');
