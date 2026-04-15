#!/usr/bin/env node
/**
 * Project-local walkthrough generator for CartoPM use-case format.
 * Adapted from ~/.claude/skills/pipeline-step6/generate-walkthrough.js to
 * parse table-style use-case docs (## US-X.X: Title → ### Subsection → | table row |).
 *
 * Usage: node scripts/generate-walkthrough.js [project-dir]
 */

const fs = require('fs');
const path = require('path');

const projectDir = process.argv[2] || path.resolve(__dirname, '..');
const useCaseDir = path.join(projectDir, 'tests', 'e2e', 'use-cases');
const screenshotsDir = path.join(projectDir, 'docs', 'delivery', 'screenshots');
const specFinalPath = path.join(projectDir, 'docs', 'pipeline', 'spec-final.md');
const outputPath = path.join(projectDir, 'docs', 'delivery', 'user-journey-walkthrough.html');

if (!fs.existsSync(useCaseDir)) { console.error(`Not found: ${useCaseDir}`); process.exit(1); }
if (!fs.existsSync(screenshotsDir)) { console.error(`Not found: ${screenshotsDir}`); process.exit(1); }

// ─── classifications ────────────────────────────────────────────────────────
const classifications = {};
if (fs.existsSync(specFinalPath)) {
  const spec = fs.readFileSync(specFinalPath, 'utf8');
  const re = /###\s+(US-[A-Z0-9.-]+)[^\n]*?\[(UNCHANGED|MODIFIED|NEW|REMOVED|PARTIAL)\]/g;
  let m;
  while ((m = re.exec(spec)) !== null) classifications[m[1]] = m[2];
}

// ─── parse use-case ─────────────────────────────────────────────────────────
function parseUseCase(filePath) {
  const lines = fs.readFileSync(filePath, 'utf8').split('\n');
  const milestone = { title: '', stories: [] };
  let currentStory = null;
  let currentSub = null;

  for (const rawLine of lines) {
    const line = rawLine.replace(/\r$/, '');

    if (line.startsWith('# ')) {
      milestone.title = line.slice(2).trim();
      continue;
    }

    // Story: "## US-X.X: Title"
    const storyMatch = line.match(/^##\s+(US-[A-Z0-9.-]+)\s*[:—-]\s*(.+)$/);
    if (storyMatch) {
      currentStory = {
        id: storyMatch[1],
        title: storyMatch[2].trim(),
        subsections: [],
      };
      currentSub = null;
      milestone.stories.push(currentStory);
      continue;
    }

    // Subsection: "### Anything"
    if (line.startsWith('### ') && currentStory) {
      currentSub = {
        title: line.slice(4).trim(),
        steps: [],
      };
      currentStory.subsections.push(currentSub);
      continue;
    }

    // Table row with screenshot
    // Format: | N | action | expected | `US-X.X-NN-desc.png` |
    const tableMatch = line.match(/^\|\s*([^|]*?)\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*`([^`]+\.png)`\s*\|/);
    if (tableMatch && currentSub) {
      const [, stepNum, action, expected, screenshot] = tableMatch;
      currentSub.steps.push({
        stepNum: stepNum.trim(),
        action: action.trim(),
        expected: expected.trim(),
        screenshot: screenshot.replace(/\.png$/i, '').trim(),
      });
    }
  }

  return milestone;
}

// ─── embed PNG as base64 ────────────────────────────────────────────────────
function embedScreenshot(name) {
  const filePath = path.join(screenshotsDir, `${name}.png`);
  if (!fs.existsSync(filePath)) return null;
  return `data:image/png;base64,${fs.readFileSync(filePath).toString('base64')}`;
}

// ─── html ───────────────────────────────────────────────────────────────────
const MILESTONE_COLORS = ['#c17b47', '#7a9b6e', '#4a7c8a', '#b8806a', '#5f7a5f', '#8a6d4a'];

function escapeHtml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function badgeClass(cls) {
  if (cls === 'MODIFIED' || cls === 'PARTIAL') return 'badge-modified';
  if (cls === 'NEW') return 'badge-new';
  if (cls === 'REMOVED') return 'badge-removed';
  return 'badge-unchanged';
}

let missingCount = 0;
function renderStep(step, index, color) {
  const img = embedScreenshot(step.screenshot);
  const imgHtml = img
    ? `<img src="${img}" alt="${escapeHtml(step.screenshot)}" loading="lazy" />`
    : (missingCount++, `<div class="missing-screenshot">⚠️ Screenshot missing: <code>${escapeHtml(step.screenshot)}.png</code></div>`);
  return `
    <div class="step">
      <div class="step-num" style="background:${color}">${escapeHtml(step.stepNum || String(index + 1))}</div>
      <div class="step-body">
        <p class="step-action"><strong>${escapeHtml(step.action)}</strong></p>
        <p class="step-expected">→ ${escapeHtml(step.expected)}</p>
        <div class="step-screenshot">${imgHtml}</div>
      </div>
    </div>`;
}

function renderSubsection(sub, color) {
  const steps = sub.steps.map((s, i) => renderStep(s, i, color)).join('\n');
  return `
    <div class="subsection">
      <h4 class="subsection-title">${escapeHtml(sub.title)}</h4>
      <div class="subsection-steps">${steps}</div>
    </div>`;
}

function renderStory(story, color) {
  const cls = classifications[story.id] || 'UNCHANGED';
  const subs = story.subsections.map((sub) => renderSubsection(sub, color)).join('\n');
  const totalSteps = story.subsections.reduce((a, s) => a + s.steps.length, 0);
  return `
    <section class="story" id="${story.id}">
      <h3 class="story-title">
        <span class="story-id">${story.id}</span>
        ${escapeHtml(story.title)}
        <span class="badge ${badgeClass(cls)}">${cls}</span>
        <span class="story-meta">${totalSteps} steps</span>
      </h3>
      ${subs}
    </section>`;
}

function renderMilestone(milestone, index) {
  const color = MILESTONE_COLORS[index] || MILESTONE_COLORS[0];
  const mid = `m${index + 1}`;
  const storiesHtml = milestone.stories.map((s) => renderStory(s, color)).join('\n');
  return `
    <article class="milestone" id="${mid}" style="--milestone-color:${color}">
      <header class="milestone-header" style="border-left-color:${color}">
        <h2>${escapeHtml(milestone.title)}</h2>
        <p class="milestone-meta">${milestone.stories.length} stories · ${milestone.stories.reduce((a, s) => a + s.subsections.reduce((b, x) => b + x.steps.length, 0), 0)} steps</p>
      </header>
      ${storiesHtml}
      <a class="back-to-top" href="#top">↑ Back to top</a>
    </article>`;
}

function renderToc(milestones) {
  return milestones
    .map((m, i) => {
      const mid = `m${i + 1}`;
      const storyLinks = m.stories
        .map((s) => `<li><a href="#${s.id}">${s.id} — ${escapeHtml(s.title)}</a></li>`)
        .join('');
      return `
        <div class="toc-milestone">
          <a class="toc-milestone-link" href="#${mid}" style="--ms-color:${MILESTONE_COLORS[i]}">${escapeHtml(m.title)}</a>
          <ul class="toc-stories">${storyLinks}</ul>
        </div>`;
    })
    .join('\n');
}

function renderHtml(milestones) {
  const totalStories = milestones.reduce((a, m) => a + m.stories.length, 0);
  const totalSteps = milestones.reduce(
    (a, m) => a + m.stories.reduce((b, s) => b + s.subsections.reduce((c, x) => c + x.steps.length, 0), 0), 0);
  const tocHtml = renderToc(milestones);
  const milestonesHtml = milestones.map((m, i) => renderMilestone(m, i)).join('\n');

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>CartoPM — User Journey Walkthrough</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet">
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{font-family:'DM Sans',system-ui,sans-serif;background:#faf9f6;color:#2b2a28;line-height:1.55;font-size:15px}
h1,h2,h3,h4{font-family:'Space Grotesk',sans-serif;font-weight:700;letter-spacing:-.015em}
code{font-family:'JetBrains Mono',Menlo,monospace;font-size:.9em;background:#ede9e0;padding:1px 5px;border-radius:3px}
.layout{display:grid;grid-template-columns:280px 1fr;min-height:100vh}
nav.toc{position:sticky;top:0;align-self:start;height:100vh;overflow-y:auto;background:#efeadf;border-right:1px solid #d8d1c1;padding:24px 20px}
nav.toc h1{font-size:17px;margin-bottom:18px;color:#2b2a28}
.toc-milestone{margin-bottom:16px}
.toc-milestone-link{display:block;font-weight:700;font-family:'Space Grotesk',sans-serif;color:var(--ms-color);text-decoration:none;margin-bottom:6px;border-left:3px solid var(--ms-color);padding-left:8px}
.toc-stories{list-style:none;padding-left:12px;font-size:13px}
.toc-stories li{margin:3px 0}
.toc-stories a{color:#5e574b;text-decoration:none}
.toc-stories a:hover{color:#2b2a28;text-decoration:underline}
main{padding:32px 48px;max-width:1200px}
main>header{margin-bottom:40px;padding-bottom:24px;border-bottom:2px solid #d8d1c1}
main>header h1{font-size:32px;margin-bottom:6px}
main>header p.sub{color:#6d6a5f;font-size:15px}
main>header .stats{display:flex;gap:24px;margin-top:14px;font-size:14px;color:#6d6a5f}
main>header .stats span strong{color:#2b2a28;font-family:'Space Grotesk',sans-serif;font-size:18px;display:block}
.milestone{margin-bottom:56px}
.milestone-header{padding:18px 22px;border-left:5px solid;background:#f3efe5;border-radius:0 8px 8px 0;margin-bottom:28px}
.milestone-header h2{font-size:22px;margin-bottom:4px}
.milestone-meta{color:#6d6a5f;font-size:13px}
.story{margin-bottom:40px;background:#fff;border:1px solid #e4dfd1;border-radius:10px;padding:22px 26px}
.story-title{font-size:18px;display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid #efeadf}
.story-id{font-family:'JetBrains Mono',Menlo,monospace;color:#6d6a5f;font-size:13px;background:#f3efe5;padding:2px 8px;border-radius:4px}
.story-meta{margin-left:auto;font-size:12px;color:#8b8679;font-weight:400}
.badge{font-size:11px;font-weight:700;padding:3px 8px;border-radius:3px;text-transform:uppercase;letter-spacing:.04em;font-family:'Space Grotesk',sans-serif}
.badge-unchanged{background:#e0e4d6;color:#4a5c2a}
.badge-modified{background:#f0d8c5;color:#8a4a1e}
.badge-new{background:#d6e0e4;color:#1e5a7a}
.badge-removed{background:#e4d6d6;color:#7a1e1e}
.subsection{margin:18px 0 10px}
.subsection-title{font-size:14px;text-transform:uppercase;letter-spacing:.05em;color:#6d6a5f;margin:14px 0 10px}
.subsection-steps{display:flex;flex-direction:column;gap:14px}
.step{display:flex;gap:14px;align-items:flex-start}
.step-num{flex-shrink:0;width:32px;height:32px;border-radius:50%;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-family:'Space Grotesk',sans-serif;font-size:13px}
.step-body{flex:1;min-width:0}
.step-action{margin-bottom:2px;font-size:14px}
.step-expected{color:#6d6a5f;font-size:13px;margin-bottom:10px}
.step-screenshot img{max-width:100%;border:1px solid #d8d1c1;border-radius:6px;display:block}
.missing-screenshot{padding:16px;background:#fff3e0;border:1px dashed #d4a574;border-radius:6px;color:#8a4a1e;font-size:13px}
.back-to-top{display:inline-block;margin-top:12px;color:#6d6a5f;text-decoration:none;font-size:13px}
.back-to-top:hover{color:#2b2a28}
@media (max-width:768px){
  .layout{grid-template-columns:1fr}
  nav.toc{position:static;height:auto;border-right:none;border-bottom:1px solid #d8d1c1}
  main{padding:24px 20px}
}
</style>
</head>
<body>
<div id="top"></div>
<div class="layout">
<nav class="toc">
  <h1>CartoPM<br><span style="font-weight:400;font-size:13px;color:#6d6a5f">Cartographie des Recherches en Process Mining</span></h1>
  ${tocHtml}
</nav>
<main>
<header>
  <h1>User Journey Walkthrough</h1>
  <p class="sub">Traversée complète de l'application — ${milestones.length} milestones, ${totalStories} user stories, ${totalSteps} étapes captées avec screenshots réels.</p>
  <div class="stats">
    <span><strong>${milestones.length}</strong>Milestones</span>
    <span><strong>${totalStories}</strong>Stories</span>
    <span><strong>${totalSteps}</strong>Steps</span>
    <span><strong>${missingCount}</strong>Missing screenshots</span>
  </div>
</header>
${milestonesHtml}
</main>
</div>
</body>
</html>`;
}

// ─── main ───────────────────────────────────────────────────────────────────
const files = fs.readdirSync(useCaseDir)
  .filter((f) => /^m\d+-use-case\.md$/.test(f))
  .sort();

const milestones = files.map((f) => parseUseCase(path.join(useCaseDir, f)));

const html = renderHtml(milestones);
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, html);

const totalStories = milestones.reduce((a, m) => a + m.stories.length, 0);
const totalSteps = milestones.reduce(
  (a, m) => a + m.stories.reduce((b, s) => b + s.subsections.reduce((c, x) => c + x.steps.length, 0), 0), 0);
const sizeKb = (fs.statSync(outputPath).size / 1024).toFixed(1);

console.log(`✓ Generated ${outputPath}`);
console.log(`  Milestones: ${milestones.length}`);
console.log(`  Stories: ${totalStories}`);
console.log(`  Steps: ${totalSteps}`);
console.log(`  Missing screenshots: ${missingCount}`);
console.log(`  File size: ${sizeKb} KB`);

process.exit(missingCount > 0 ? 2 : 0);
