-- Seed data for CartoPM development

-- Clusters
INSERT INTO clusters (id, name, color, sub_themes) VALUES
  ('11111111-0000-0000-0000-000000000001', 'Conformance Checking', '#0d6efd', ARRAY['alignements', 'déviations', 'fitness']),
  ('11111111-0000-0000-0000-000000000002', 'Process Discovery', '#198754', ARRAY['inductive mining', 'alpha algorithm', 'heuristics']),
  ('11111111-0000-0000-0000-000000000003', 'Process Enhancement', '#dc3545', ARRAY['performance analysis', 'bottleneck detection', 'prediction']),
  ('11111111-0000-0000-0000-000000000004', 'Object-Centric PM', '#fd7e14', ARRAY['OCEL', 'multi-object', 'object graphs'])
ON CONFLICT (id) DO NOTHING;

-- Researchers (status: approved for demo data)
INSERT INTO researchers (id, full_name, lab, bio, keywords, status, map_x, map_y, cluster_id) VALUES
  ('22222222-0000-0000-0000-000000000001', 'Marie Dupont', 'LIRIS', 'Chercheuse en conformance checking et alignements de traces.', ARRAY['conformance', 'alignement', 'process mining'], 'approved', 0.2, 0.3, '11111111-0000-0000-0000-000000000001'),
  ('22222222-0000-0000-0000-000000000002', 'Jean Martin', 'LIMOS', 'Spécialiste en découverte de processus et algorithmes inductifs.', ARRAY['process discovery', 'inductive mining', 'Petri nets'], 'approved', 0.7, 0.4, '11111111-0000-0000-0000-000000000002'),
  ('22222222-0000-0000-0000-000000000003', 'Sophie Leclerc', 'IRISA', 'Travaille sur la prédiction et l''analyse de performance des processus.', ARRAY['performance', 'prediction', 'enhancement'], 'approved', 0.5, 0.7, '11111111-0000-0000-0000-000000000003'),
  ('22222222-0000-0000-0000-000000000004', 'Ahmed Benali', 'LIG', 'Recherche sur les event logs multi-objets et les traces OCEL.', ARRAY['OCEL', 'object-centric', 'multi-object'], 'approved', 0.8, 0.2, '11111111-0000-0000-0000-000000000004'),
  ('22222222-0000-0000-0000-000000000005', 'Claire Fontaine', 'LIRIS', 'Experte en vérification formelle et modèles de conformité.', ARRAY['formal verification', 'conformance', 'model checking'], 'approved', 0.3, 0.2, '11111111-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- Publications
INSERT INTO publications (researcher_id, title, coauthors, venue, year) VALUES
  ('22222222-0000-0000-0000-000000000001', 'Alignement optimal de traces d''événements', 'Jean Martin', 'ICPM 2023', 2023),
  ('22222222-0000-0000-0000-000000000001', 'Conformance Checking via A*', 'Claire Fontaine', 'BPM 2022', 2022),
  ('22222222-0000-0000-0000-000000000002', 'Inductive Miner Revisited', 'Sophie Leclerc', 'ICPM 2023', 2023),
  ('22222222-0000-0000-0000-000000000002', 'Découverte de processus avec Petri nets', '', 'BPM 2021', 2021),
  ('22222222-0000-0000-0000-000000000003', 'Bottleneck Detection in Healthcare Processes', 'Ahmed Benali', 'ICPM 2022', 2022),
  ('22222222-0000-0000-0000-000000000004', 'Object-Centric Event Logs: New Challenges', 'Marie Dupont', 'PODS 2023', 2023),
  ('22222222-0000-0000-0000-000000000005', 'Model Checking for Process Compliance', 'Marie Dupont', 'CAV 2023', 2023)
ON CONFLICT DO NOTHING;

-- Similarity scores
INSERT INTO similarity_scores (researcher_a, researcher_b, score, algorithm) VALUES
  ('22222222-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000005', 0.82, 'tfidf'),
  ('22222222-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000002', 0.45, 'tfidf'),
  ('22222222-0000-0000-0000-000000000002', '22222222-0000-0000-0000-000000000003', 0.61, 'tfidf'),
  ('22222222-0000-0000-0000-000000000003', '22222222-0000-0000-0000-000000000004', 0.38, 'tfidf'),
  ('22222222-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000003', 0.29, 'tfidf')
ON CONFLICT DO NOTHING;

-- App settings defaults
INSERT INTO app_settings (key, value) VALUES
  ('language', '"fr"'),
  ('similarity_threshold', '0.3'),
  ('nlp_algorithm', '"tfidf"')
ON CONFLICT (key) DO NOTHING;

-- Audit logs (sample activity feed)
INSERT INTO audit_logs (user_name, action, detail, created_at) VALUES
  ('Marie Dupont', 'Ajout', 'Nouveau profil créé', now() - interval '2 hours'),
  ('Jean Martin', 'Modification', 'Profil mis à jour — nouvelles publications', now() - interval '5 hours'),
  ('Sophie Leclerc', 'Ajout', 'Nouveau profil créé', now() - interval '1 day'),
  ('Ahmed Benali', 'Modification', 'Mots-clés mis à jour', now() - interval '2 days'),
  ('Claire Fontaine', 'Ajout', 'Nouveau profil créé', now() - interval '3 days')
ON CONFLICT DO NOTHING;
