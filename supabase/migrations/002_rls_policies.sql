-- Row Level Security Policies for CartoPM

-- Enable RLS on all tables
ALTER TABLE researchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE publications ENABLE ROW LEVEL SECURITY;
ALTER TABLE clusters ENABLE ROW LEVEL SECURITY;
ALTER TABLE similarity_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND raw_user_meta_data->>'role' = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- RESEARCHERS: public can see approved; owners can see own; admins see all
CREATE POLICY "Public can view approved researchers"
  ON researchers FOR SELECT
  USING (status = 'approved' OR auth.uid() = user_id OR is_admin());

CREATE POLICY "Researchers can insert own profile"
  ON researchers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Researchers can update own profile"
  ON researchers FOR UPDATE
  USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Admins can delete researchers"
  ON researchers FOR DELETE
  USING (is_admin());

-- PUBLICATIONS: follow researcher visibility
CREATE POLICY "Public can view publications of approved researchers"
  ON publications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM researchers r
      WHERE r.id = publications.researcher_id
      AND (r.status = 'approved' OR r.user_id = auth.uid() OR is_admin())
    )
  );

CREATE POLICY "Researchers can manage own publications"
  ON publications FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM researchers r
      WHERE r.id = researcher_id AND r.user_id = auth.uid()
    )
  );

CREATE POLICY "Researchers can update own publications"
  ON publications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM researchers r
      WHERE r.id = researcher_id AND r.user_id = auth.uid()
    )
  );

CREATE POLICY "Researchers can delete own publications"
  ON publications FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM researchers r
      WHERE r.id = researcher_id AND r.user_id = auth.uid()
    )
    OR is_admin()
  );

-- CLUSTERS: public read, admin write
CREATE POLICY "Anyone can view clusters"
  ON clusters FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage clusters"
  ON clusters FOR ALL
  USING (is_admin());

-- SIMILARITY: public read (approved pairs), admin write
CREATE POLICY "Anyone can view similarity scores"
  ON similarity_scores FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage similarity"
  ON similarity_scores FOR ALL
  USING (is_admin());

-- APP SETTINGS: public read, admin write
CREATE POLICY "Anyone can view settings"
  ON app_settings FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage settings"
  ON app_settings FOR ALL
  USING (is_admin());

-- AUDIT LOGS: admin only
CREATE POLICY "Admins can view audit logs"
  ON audit_logs FOR SELECT
  USING (is_admin());

CREATE POLICY "Authenticated can insert audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- INVITATIONS: admin only
CREATE POLICY "Admins can manage invitations"
  ON invitations FOR ALL
  USING (is_admin());
