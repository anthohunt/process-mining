-- Initial schema for CartoPM

-- clusters must come before researchers (FK dependency)
CREATE TABLE IF NOT EXISTS clusters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  sub_themes TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- researchers
CREATE TABLE IF NOT EXISTS researchers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  full_name TEXT NOT NULL,
  lab TEXT NOT NULL,
  bio TEXT DEFAULT '',
  keywords TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  map_x FLOAT,
  map_y FLOAT,
  cluster_id UUID REFERENCES clusters(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- publications
CREATE TABLE IF NOT EXISTS publications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  researcher_id UUID REFERENCES researchers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  coauthors TEXT DEFAULT '',
  venue TEXT DEFAULT '',
  year INT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- similarity_scores
CREATE TABLE IF NOT EXISTS similarity_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  researcher_a UUID REFERENCES researchers(id) ON DELETE CASCADE,
  researcher_b UUID REFERENCES researchers(id) ON DELETE CASCADE,
  score FLOAT NOT NULL CHECK (score >= 0 AND score <= 1),
  algorithm TEXT DEFAULT 'tfidf',
  computed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(researcher_a, researcher_b, algorithm)
);

-- app_settings
CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- audit_logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  user_name TEXT,
  action TEXT NOT NULL,
  detail TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- invitations
CREATE TABLE IF NOT EXISTS invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  role TEXT DEFAULT 'researcher',
  invited_by UUID REFERENCES auth.users(id),
  accepted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
