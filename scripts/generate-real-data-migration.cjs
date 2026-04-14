/**
 * Generate SQL migration for 105 real process mining researchers.
 * Reads data/process-mining-researchers.json -> outputs supabase/migrations/004_real_researcher_data.sql
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const data = require('../data/process-mining-researchers.json');

// ─── Cluster Definitions ────────────────────────────────────────────
// 10 thematic clusters based on actual research theme frequency analysis
const CLUSTERS = [
  {
    id: 'c0000000-0001-4000-8000-000000000001',
    name: 'Process Discovery',
    color: '#198754',
    sub_themes: ['process discovery', 'inductive mining', 'alpha algorithm', 'heuristics mining', 'split miner', 'directly-follows graphs', 'automated discovery'],
    keywords: ['process discovery', 'inductive mining', 'alpha algorithm', 'heuristics', 'split miner', 'directly-follows', 'automated discovery', 'discovery algorithm', 'Petri nets', 'stochastic process mining', 'streaming process discovery', 'online process mining', 'streaming', 'process model repair', 'process comparison', 'event log abstraction', 'bupaR', 'process metrics', 'trace clustering', 'event log', 'log generation', 'process querying']
  },
  {
    id: 'c0000000-0002-4000-8000-000000000002',
    name: 'Conformance Checking',
    color: '#0d6efd',
    sub_themes: ['alignments', 'fitness', 'precision', 'compliance monitoring', 'model repair', 'conformance'],
    keywords: ['conformance checking', 'alignments', 'fitness', 'precision', 'compliance', 'model repair', 'conformance', 'model checking', 'soundness', 'behavioral', 'behavioral relations', 'change detection', 'event structures']
  },
  {
    id: 'c0000000-0003-4000-8000-000000000003',
    name: 'Predictive & Prescriptive Monitoring',
    color: '#6f42c1',
    sub_themes: ['predictive monitoring', 'prescriptive analytics', 'machine learning', 'deep learning', 'outcome prediction', 'remaining time'],
    keywords: ['predictive process monitoring', 'prescriptive analytics', 'machine learning', 'deep learning', 'prediction', 'outcome prediction', 'remaining time', 'LSTM', 'next activity', 'neural network', 'encoding', 'causal analysis', 'industrial AI', 'business analytics', 'organizational mining']
  },
  {
    id: 'c0000000-0004-4000-8000-000000000004',
    name: 'Object-Centric Process Mining',
    color: '#fd7e14',
    sub_themes: ['OCEL', 'multi-object', 'object graphs', 'event data management', 'multi-dimensional'],
    keywords: ['object-centric', 'OCEL', 'multi-object', 'object graph', 'event data management', 'multi-dimensional', 'data integration', 'schema matching', 'data quality', 'process data quality', 'event data quality', 'preprocessing']
  },
  {
    id: 'c0000000-0005-4000-8000-000000000005',
    name: 'Privacy & Responsible Process Mining',
    color: '#dc3545',
    sub_themes: ['privacy-preserving', 'differential privacy', 'fairness', 'responsible mining', 'confidentiality'],
    keywords: ['privacy', 'differential privacy', 'responsible', 'fairness', 'confidentiality', 'privacy-preserving', 'ethical', 'auditing', 'internal control', 'fraud detection', 'accounting']
  },
  {
    id: 'c0000000-0006-4000-8000-000000000006',
    name: 'Healthcare Process Mining',
    color: '#20c997',
    sub_themes: ['clinical pathways', 'medical processes', 'patient flow', 'care processes', 'health informatics'],
    keywords: ['healthcare', 'clinical', 'medical', 'patient', 'care process', 'health informatics', 'hospital']
  },
  {
    id: 'c0000000-0007-4000-8000-000000000007',
    name: 'Declarative & Formal Methods',
    color: '#0dcaf0',
    sub_themes: ['declarative mining', 'temporal logic', 'Declare', 'LTL', 'formal verification', 'constraints'],
    keywords: ['declarative', 'temporal logic', 'Declare', 'LTL', 'formal verification', 'constraint', 'specification', 'knowledge-intensive', 'formal method', 'verification', 'data-aware process', 'planning and BPM', 'model-driven']
  },
  {
    id: 'c0000000-0008-4000-8000-000000000008',
    name: 'Process Improvement & Simulation',
    color: '#e83e8c',
    sub_themes: ['performance analysis', 'bottleneck detection', 'redesign', 'optimization', 'simulation', 'enhancement'],
    keywords: ['process improvement', 'bottleneck', 'redesign', 'optimization', 'simulation', 'enhancement', 'performance analysis', 'process change', 'process flexibility', 'adaptive', 'batch processing', 'resource management', 'performance management', 'SLA', 'dashboard', 'visualization', 'human factors', 'cognitive', 'comprehension', 'process model evaluation']
  },
  {
    id: 'c0000000-0009-4000-8000-000000000009',
    name: 'BPM Foundations & Modeling',
    color: '#6c757d',
    sub_themes: ['process modeling', 'BPMN', 'workflow management', 'process architecture', 'process-aware systems'],
    keywords: ['business process management', 'process modeling', 'BPMN', 'workflow', 'process-aware', 'service-oriented', 'process architecture', 'process model quality', 'process analytics', 'process model complexity', 'variability', 'model-driven engineering', 'process execution']
  },
  {
    id: 'c0000000-000a-4000-8000-000000000010',
    name: 'IoT, RPA & Applied PM',
    color: '#ffc107',
    sub_themes: ['robotic process automation', 'task mining', 'IoT process mining', 'Industry 4.0', 'manufacturing', 'smart environments'],
    keywords: ['RPA', 'robotic process', 'task mining', 'UI log', 'user interaction', 'desktop', 'IoT', 'smart environment', 'Industry 4.0', 'manufacturing', 'shipbuilding', 'cloud-based', 'artifact-driven', 'smart object', 'blockchain', 'context-aware', 'habit mining', 'pervasive', 'mobile']
  }
];

// Manual overrides for researchers whose themes are too general
const MANUAL_OVERRIDES = {
  'Han van der Aa': 'c0000000-0001-4000-8000-000000000001', // NLP for process comparison → Discovery
  'Hagen Volzer': 'c0000000-0002-4000-8000-000000000002', // soundness checking → Conformance
  'Andrey Rivkin': 'c0000000-0007-4000-8000-000000000007', // formal methods → Declarative
  'Michael Arias': 'c0000000-000a-4000-8000-000000000010', // applications in Latin America → Applied PM
  'Lorenzo Rossi': 'c0000000-0004-4000-8000-000000000004', // data quality → Object-Centric/Data
  'Minseok Song': 'c0000000-0003-4000-8000-000000000003', // business analytics, organizational mining → Predictive
  'Minsu Cho': 'c0000000-0003-4000-8000-000000000003', // data-driven optimization → Predictive
  'Daniela Grigori': 'c0000000-0001-4000-8000-000000000001', // workflow analysis, process querying → Discovery
  'Saimir Bala': 'c0000000-0004-4000-8000-000000000004', // event log preprocessing → Data/Object-Centric
  'Luise Pufahl': 'c0000000-0008-4000-8000-000000000008', // batch processing, resource management → Improvement
};

// ─── Cluster Assignment ─────────────────────────────────────────────
function assignCluster(researcher) {
  // Check manual overrides first
  if (MANUAL_OVERRIDES[researcher.name]) {
    return CLUSTERS.find(c => c.id === MANUAL_OVERRIDES[researcher.name]);
  }

  let bestCluster = null;
  let bestScore = 0;

  for (const cluster of CLUSTERS) {
    let score = 0;
    for (const theme of researcher.research_themes) {
      const tLower = theme.toLowerCase();
      // Skip overly generic themes for matching
      if (tLower === 'process mining') continue;
      for (const kw of cluster.keywords) {
        const kwLower = kw.toLowerCase();
        // theme contains keyword, or keyword contains theme (but only if theme is specific enough)
        if (tLower.includes(kwLower) || (tLower.length > 12 && kwLower.includes(tLower))) {
          score += 1;
        }
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestCluster = cluster;
    }
  }

  // Fallback: BPM Foundations if no match
  return bestCluster || CLUSTERS[8];
}

// ─── Map Positioning ────────────────────────────────────────────────
// Position researchers in cluster regions on a 0-1 grid.
// Each cluster gets a region; researchers scatter within it.
const CLUSTER_CENTERS = {
  'c0000000-0001-4000-8000-000000000001': { cx: 0.15, cy: 0.20 }, // Process Discovery (top-left)
  'c0000000-0002-4000-8000-000000000002': { cx: 0.45, cy: 0.15 }, // Conformance Checking (top-center)
  'c0000000-0003-4000-8000-000000000003': { cx: 0.80, cy: 0.20 }, // Predictive (top-right)
  'c0000000-0004-4000-8000-000000000004': { cx: 0.15, cy: 0.50 }, // Object-Centric (mid-left)
  'c0000000-0005-4000-8000-000000000005': { cx: 0.85, cy: 0.50 }, // Privacy (mid-right)
  'c0000000-0006-4000-8000-000000000006': { cx: 0.50, cy: 0.45 }, // Healthcare (center)
  'c0000000-0007-4000-8000-000000000007': { cx: 0.30, cy: 0.75 }, // Declarative (bottom-left)
  'c0000000-0008-4000-8000-000000000008': { cx: 0.65, cy: 0.75 }, // Improvement (bottom-center-right)
  'c0000000-0009-4000-8000-000000000009': { cx: 0.50, cy: 0.90 }, // BPM Foundations (bottom-center)
  'c0000000-000a-4000-8000-000000000010': { cx: 0.85, cy: 0.85 }, // RPA (bottom-right)
};

function deterministicRandom(seed) {
  const hash = crypto.createHash('md5').update(seed).digest();
  return (hash.readUInt16BE(0) / 65535);
}

function positionResearcher(researcher, clusterId, index) {
  const center = CLUSTER_CENTERS[clusterId];
  const spread = 0.10;
  const angle = deterministicRandom(researcher.name + 'a') * Math.PI * 2;
  const radius = deterministicRandom(researcher.name + 'r') * spread;
  let x = center.cx + Math.cos(angle) * radius;
  let y = center.cy + Math.sin(angle) * radius;
  // Clamp to 0.02-0.98
  x = Math.max(0.02, Math.min(0.98, x));
  y = Math.max(0.02, Math.min(0.98, y));
  return { x: parseFloat(x.toFixed(4)), y: parseFloat(y.toFixed(4)) };
}

// ─── UUID Generation ────────────────────────────────────────────────
function researcherId(index) {
  const hex = (index + 1).toString(16).padStart(12, '0');
  return `a0000000-0000-4000-8000-${hex}`;
}

// ─── SQL Escaping ───────────────────────────────────────────────────
function esc(str) {
  if (!str) return "''";
  return "'" + str.replace(/'/g, "''") + "'";
}

function arrEsc(arr) {
  if (!arr || arr.length === 0) return "ARRAY[]::text[]";
  return "ARRAY[" + arr.map(s => esc(s)).join(', ') + "]";
}

// ─── Build SQL ──────────────────────────────────────────────────────
const lines = [];
lines.push('-- Migration 004: Real Process Mining Researcher Data');
lines.push('-- Generated ' + new Date().toISOString().split('T')[0]);
lines.push('-- 105 real researchers from IEEE Task Force, ICPM, processmining.org');
lines.push('');

// Delete old seed data (in correct order for FK constraints)
lines.push('-- Clear old seed data');
lines.push("DELETE FROM similarity_scores;");
lines.push("DELETE FROM publications;");
lines.push("DELETE FROM audit_logs;");
lines.push("DELETE FROM researchers;");
lines.push("DELETE FROM clusters;");
lines.push('');

// Insert clusters
lines.push('-- Clusters (10 thematic areas)');
for (const c of CLUSTERS) {
  lines.push(`INSERT INTO clusters (id, name, color, sub_themes) VALUES (${esc(c.id)}, ${esc(c.name)}, ${esc(c.color)}, ${arrEsc(c.sub_themes)});`);
}
lines.push('');

// Process researchers
lines.push('-- Researchers (105 real process mining scholars)');
const assignments = []; // track {researcherId, clusterId, keywords} for similarity

for (let i = 0; i < data.researchers.length; i++) {
  const r = data.researchers[i];
  const cluster = assignCluster(r);
  const rid = researcherId(i);
  const pos = positionResearcher(r, cluster.id, i);

  // Build bio — include secondary affiliation if present
  let bio = r.bio || '';
  if (r.secondary_affiliation) {
    bio += (bio ? ' ' : '') + 'Also: ' + r.secondary_affiliation + '.';
  }

  // Lab = affiliation + department
  const lab = r.department ? `${r.affiliation} — ${r.department}` : r.affiliation;

  assignments.push({
    id: rid,
    name: r.name,
    keywords: r.research_themes,
    clusterId: cluster.id
  });

  lines.push(`INSERT INTO researchers (id, full_name, lab, bio, keywords, status, map_x, map_y, cluster_id) VALUES (${esc(rid)}, ${esc(r.name)}, ${esc(lab)}, ${esc(bio)}, ${arrEsc(r.research_themes)}, 'approved', ${pos.x}, ${pos.y}, ${esc(cluster.id)});`);
}
lines.push('');

// Publications
lines.push('-- Publications');
for (let i = 0; i < data.researchers.length; i++) {
  const r = data.researchers[i];
  const rid = researcherId(i);
  if (r.notable_publications) {
    for (const pub of r.notable_publications) {
      const coauthors = ''; // We don't have coauthor data per-pub in the JSON
      lines.push(`INSERT INTO publications (researcher_id, title, coauthors, venue, year) VALUES (${esc(rid)}, ${esc(pub.title)}, ${esc(coauthors)}, ${esc(pub.venue)}, ${pub.year});`);
    }
  }
}
lines.push('');

// Similarity scores — compute Jaccard for researchers in the same or neighboring clusters
lines.push('-- Similarity scores (Jaccard on keywords, top pairs per researcher)');
const similarities = [];

for (let i = 0; i < assignments.length; i++) {
  for (let j = i + 1; j < assignments.length; j++) {
    const a = assignments[i];
    const b = assignments[j];
    const setA = new Set(a.keywords.map(k => k.toLowerCase()));
    const setB = new Set(b.keywords.map(k => k.toLowerCase()));
    const intersection = [...setA].filter(x => setB.has(x));
    const union = new Set([...setA, ...setB]);
    const jaccard = intersection.length / union.size;

    if (jaccard >= 0.15) {
      similarities.push({ a: a.id, b: b.id, score: parseFloat(jaccard.toFixed(4)) });
    }
  }
}

// Sort by score desc, take top 500 to keep it manageable
similarities.sort((a, b) => b.score - a.score);
const topSim = similarities.slice(0, 500);

for (const s of topSim) {
  lines.push(`INSERT INTO similarity_scores (researcher_a, researcher_b, score, algorithm) VALUES (${esc(s.a)}, ${esc(s.b)}, ${s.score}, 'jaccard');`);
}
lines.push('');

// Audit logs (recent activity)
lines.push('-- Audit logs (sample activity)');
const sampleNames = data.researchers.slice(0, 10).map(r => r.name);
const actions = ['Ajout', 'Modification', 'Ajout', 'Modification', 'Ajout'];
for (let i = 0; i < sampleNames.length; i++) {
  const action = actions[i % actions.length];
  const detail = action === 'Ajout' ? 'Nouveau profil importé (données réelles)' : 'Profil mis à jour — publications ajoutées';
  const interval = `${(i + 1) * 3} hours`;
  lines.push(`INSERT INTO audit_logs (user_name, action, detail, created_at) VALUES (${esc(sampleNames[i])}, ${esc(action)}, ${esc(detail)}, now() - interval '${interval}');`);
}
lines.push('');

// Write the file
const outPath = path.join(__dirname, '..', 'supabase', 'migrations', '004_real_researcher_data.sql');
fs.writeFileSync(outPath, lines.join('\n'), 'utf8');

// Stats
const clusterCounts = {};
for (const a of assignments) {
  const cName = CLUSTERS.find(c => c.id === a.clusterId).name;
  clusterCounts[cName] = (clusterCounts[cName] || 0) + 1;
}

console.log('Migration generated:', outPath);
console.log('Researchers:', assignments.length);
console.log('Publications:', data.researchers.reduce((s, r) => s + (r.notable_publications?.length || 0), 0));
console.log('Similarity pairs (>=0.15):', topSim.length);
console.log('Cluster distribution:');
Object.entries(clusterCounts).sort((a, b) => b[1] - a[1]).forEach(([name, count]) => {
  console.log(`  ${name}: ${count}`);
});
