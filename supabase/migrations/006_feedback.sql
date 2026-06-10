-- Migration 006: in-app feedback (bug / suggestion) — client meeting 2026-06-10 (feature ④)

CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('bug', 'suggestion')),
  page TEXT DEFAULT '',
  message TEXT NOT NULL,
  reporter_name TEXT DEFAULT '',
  reporter_email TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved')),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Inserts go through the serverless API (service role). Admins can read/manage.
CREATE POLICY "Admins can view feedback" ON feedback FOR SELECT USING (is_admin());
CREATE POLICY "Admins can update feedback" ON feedback FOR UPDATE USING (is_admin());
