// annotate-m5.cjs — annotates M5 delivery screenshots with red highlight rectangles
// Usage: node annotate-m5.cjs
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const DELIVERY_DIR = 'C:/Users/ahunt/Documents/process-mining/tests/e2e/delivery';

// highlight coordinates: { x, y, w, h } — all in pixels relative to the image
// Derived from visual inspection of each screenshot
const annotations = {
  // US-4.1 — Admin panel: user management
  'US-4.1-01-admin-logged-in.png':        { x: 645, y: 10, w: 50, h: 40 },    // Admin tab in navbar
  'US-4.1-02-admin-panel.png':            { x: 33, y: 140, w: 550, h: 40 },   // five sub-tabs row
  'US-4.1-03-user-table.png':             { x: 33, y: 240, w: 980, h: 130 },  // user table with both rows
  'US-4.1-04-edit-role.png':              { x: 545, y: 345, w: 405, h: 40 },  // inline role dropdown + Save/Cancel
  'US-4.1-05-role-changed.png':           { x: 545, y: 345, w: 100, h: 40 },  // updated Admin role badge on Marie Dupont
  'US-4.1-06-invite-dialog.png':          { x: 302, y: 250, w: 440, h: 160 }, // invite modal dialog
  'US-4.1-07-invite-sent.png':            { x: 33, y: 240, w: 980, h: 130 },  // user table showing both Admin roles
  'US-4.1-08-pending-tab.png':            { x: 156, y: 140, w: 125, h: 40 },  // Profils en attente tab (active)
  'US-4.1-09-pending-list.png':           { x: 33, y: 240, w: 980, h: 130 },  // both pending profiles with Approve/Reject
  'US-4.1-09-pending-table.png':          { x: 33, y: 240, w: 980, h: 130 },  // both pending profiles table
  'US-4.1-10-approved.png':              { x: 840, y: 275, w: 168, h: 40 },  // Approuver button on Dr. Emile Rousseau
  'US-4.1-11-rejected.png':              { x: 33, y: 240, w: 980, h: 60 },   // empty pending list area
  'US-4.1-12-users-tab-full.png':         { x: 545, y: 295, w: 100, h: 40 },  // Admin role badge on Marie Dupont
  'US-4.1-13-role-select-inline.png':     { x: 545, y: 345, w: 405, h: 40 },  // inline dropdown pre-set to Admin
  'US-4.1-14-role-select-chercheur.png':  { x: 545, y: 345, w: 405, h: 40 },  // inline dropdown showing Chercheur
  'US-4.1-15-role-saved-chercheur.png':   { x: 545, y: 345, w: 115, h: 40 },  // Chercheur role badge updated
  'US-4.1-16-revoke-success.png':         { x: 670, y: 345, w: 75, h: 40 },   // REVOQUE status badge on Marie Dupont
  'US-4.1-17-invite-email-typed.png':     { x: 302, y: 295, w: 440, h: 50 },  // email field with nouveau@labo.fr typed
  'US-4.1-18-invite-success-toast.png':   { x: 670, y: 345, w: 75, h: 40 },   // REVOQUE status badge
  'US-4.1-19-pending-two-profiles.png':   { x: 33, y: 240, w: 980, h: 190 },  // four pending profiles listed
  'US-4.1-20-pending-after-approve.png':  { x: 33, y: 240, w: 980, h: 165 },  // three profiles remaining
  'US-4.1-21-pending-after-reject.png':   { x: 33, y: 240, w: 980, h: 130 },  // two profiles remaining
  'US-4.1-22-pending-empty-state.png':    { x: 33, y: 200, w: 980, h: 110 },  // empty state "Aucun profil en attente"
  'US-4.1-E1-empty-pending.png':          { x: 33, y: 200, w: 980, h: 110 },  // empty state message
  'US-4.1-E2-self-revoke-btn-disabled.png': { x: 856, y: 295, w: 88, h: 36 }, // disabled Revoquer on admin's own row
  'US-4.1-E2-self-revoke-disabled.png':   { x: 856, y: 295, w: 88, h: 36 },  // disabled Revoquer button (admin row)
  'US-4.1-E3-invite-dialog.png':          { x: 302, y: 250, w: 440, h: 160 }, // invite dialog with empty email field
  'US-4.1-E3-invite-error.png':           { x: 33, y: 240, w: 980, h: 130 },  // user table — failed invite, no new row

  // US-4.2 — Import tab
  'US-4.2-01-import-tab.png':             { x: 33, y: 195, w: 980, h: 210 },  // drag-and-drop zone + Scholar field
  'US-4.2-02-csv-preview.png':            { x: 33, y: 500, w: 980, h: 195 },  // preview table with 2 Nouveau entries
  'US-4.2-03-import-success.png':         { x: 33, y: 500, w: 980, h: 195 },  // preview table with 2 new entries
  'US-4.2-04-duplicate-detected.png':     { x: 33, y: 500, w: 980, h: 195 },  // preview with Doublon detecte badges
  'US-4.2-05-scholar-url-typed.png':      { x: 33, y: 425, w: 980, h: 58 },   // Scholar URL field with URL typed
  'US-4.2-06-csv-preview-new.png':        { x: 33, y: 425, w: 980, h: 58 },   // Scholar URL error message
  'US-4.2-07-csv-preview-scroll.png':     { x: 33, y: 425, w: 980, h: 58 },   // Scholar error alongside CSV preview
  'US-4.2-07-scholar-import.png':         { x: 33, y: 515, w: 980, h: 45 },   // Scholar not configured error message
  'US-4.2-08-import-success-logs-btn.png': { x: 33, y: 425, w: 980, h: 58 },  // Scholar error with CSV preview
  'US-4.2-09-import-success-with-logs-btn.png': { x: 33, y: 510, w: 980, h: 100 }, // green success banner + Voir les logs btn
  'US-4.2-10-duplicate-detection.png':    { x: 33, y: 500, w: 980, h: 195 },  // preview with Doublon detecte in orange
  'US-4.2-E1-invalid-format.png':         { x: 33, y: 435, w: 980, h: 40 },   // "Format invalide: colonnes attendues" error
  'US-4.2-E2-scholar-url-error.png':      { x: 33, y: 515, w: 980, h: 40 },   // "URL invalide ou profil introuvable" error

  // US-4.3 — Settings tab
  'US-4.3-01-settings-tab.png':           { x: 33, y: 260, w: 980, h: 550 },  // full settings form (language, slider, NLP)
  'US-4.3-02-slider-changed.png':         { x: 33, y: 360, w: 980, h: 90 },   // slider at 0.52 + unsaved indicator
  'US-4.3-03-settings-saved.png':         { x: 33, y: 360, w: 980, h: 90 },   // slider area + unsaved indicator
  'US-4.3-04-settings-default.png':       { x: 33, y: 260, w: 980, h: 550 },  // default settings: Francais, 0.30, TF-IDF
  'US-4.3-05-settings-english-bert.png':  { x: 33, y: 260, w: 980, h: 550 },  // English + BERT + unsaved indicator
  'US-4.3-06-settings-save-result.png':   { x: 33, y: 360, w: 980, h: 90 },   // slider + unsaved indicator
  'US-4.3-06-settings-saved-english-bert.png': { x: 33, y: 260, w: 980, h: 550 }, // English + BERT saved, no unsaved indicator
  'US-4.3-07-settings-word2vec-0.8.png':  { x: 33, y: 260, w: 980, h: 550 },  // English, Word2Vec, 0.80 + unsaved
  'US-4.3-08-settings-saved-word2vec.png': { x: 33, y: 260, w: 980, h: 550 }, // Word2Vec saved
  'US-4.3-E1-zero-threshold.png':         { x: 33, y: 390, w: 980, h: 42 },   // orange warning below slider
  'US-4.3-E2-unsaved-nav-prompt.png':     { x: 302, y: 255, w: 440, h: 145 }, // confirmation dialog
  'US-4.3-E2-01-settings-dirty-before-navigate.png': { x: 33, y: 550, w: 420, h: 40 }, // unsaved indicator + save button
  'US-4.3-E2-02-settings-unsaved-dialog.png': { x: 302, y: 255, w: 440, h: 145 }, // confirmation dialog
  'US-4.3-E2-03-settings-dialog-cancelled.png': { x: 33, y: 550, w: 420, h: 40 }, // back to settings with unsaved indicator
  'US-4.3-E2-04-settings-discarded-navigated.png': { x: 670, y: 345, w: 75, h: 40 }, // navigated away — REVOQUE badge
  'US-4.3-E3-01-zero-threshold-warning.png': { x: 33, y: 390, w: 980, h: 42 }, // orange inline warning
  'US-4.3-E3-02-zero-threshold-cancelled.png': { x: 33, y: 550, w: 420, h: 40 }, // save button + unsaved (dialog dismissed)
  'US-4.3-E3-03-zero-threshold-confirm.png': { x: 33, y: 600, w: 980, h: 90 }, // yellow confirm banner with Confirmer/Annuler

  // US-4.4 — Logs tab
  'US-4.4-01-logs-initial.png':           { x: 33, y: 320, w: 980, h: 330 },  // log table with action tags
  'US-4.4-01-logs-tab.png':               { x: 33, y: 240, w: 380, h: 80 },   // date filter inputs + Filtrer button
  'US-4.4-02-logs-date-filter.png':       { x: 440, y: 275, w: 130, h: 40 },  // Tout afficher button (newly appeared)
  'US-4.4-03-logs-filter-cleared.png':    { x: 33, y: 240, w: 380, h: 80 },   // date inputs reset to empty
  'US-4.4-04-logs-action-tags.png':       { x: 33, y: 170, w: 520, h: 420 },  // ACTION column with color-coded tags
  'US-4.4-05-logs-after-import-config.png': { x: 33, y: 355, w: 980, h: 90 }, // top two new entries: Configuration + Import
  'US-4.4-E1-01-logs-future-dates-typed.png': { x: 33, y: 260, w: 380, h: 60 }, // date inputs with future dates
  'US-4.4-E1-02-logs-empty-filter-result.png': { x: 33, y: 330, w: 980, h: 60 }, // "Aucun log pour cette periode" message
};

async function annotateScreenshot(page, filename, coords) {
  const filePath = path.join(DELIVERY_DIR, filename).replace(/\\/g, '/');

  if (!fs.existsSync(filePath)) {
    console.log(`SKIP (missing): ${filename}`);
    return false;
  }

  const fileUrl = 'file:///' + filePath;

  await page.goto(fileUrl);

  await page.evaluate(({ x, y, w, h }) => {
    const img = document.querySelector('img');
    if (!img) return;

    const iw = img.naturalWidth || img.width;
    const ih = img.naturalHeight || img.height;

    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.overflow = 'hidden';
    document.body.style.background = '#fff';
    document.documentElement.style.margin = '0';
    document.documentElement.style.padding = '0';

    img.style.display = 'block';
    img.style.width = iw + 'px';
    img.style.height = ih + 'px';
    img.style.position = 'absolute';
    img.style.top = '0';
    img.style.left = '0';

    document.body.style.width = iw + 'px';
    document.body.style.height = ih + 'px';
    document.body.style.position = 'relative';

    const overlay = document.createElement('div');
    overlay.style.cssText = [
      'position:absolute',
      `left:${x - 8}px`,
      `top:${y - 8}px`,
      `width:${w + 16}px`,
      `height:${h + 16}px`,
      'border:3px solid #dc3545',
      'box-shadow:0 0 4px rgba(220,53,69,0.4)',
      'background:transparent',
      'pointer-events:none',
      'box-sizing:border-box',
      'z-index:9999',
    ].join(';');
    document.body.appendChild(overlay);
  }, coords);

  const dims = await page.evaluate(() => {
    const img = document.querySelector('img');
    return { w: img ? img.naturalWidth : 1044, h: img ? img.naturalHeight : 784 };
  });

  await page.setViewportSize({ width: dims.w, height: dims.h });

  await page.screenshot({ path: path.join(DELIVERY_DIR, filename), fullPage: false });
  return true;
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const files = Object.keys(annotations);
  let done = 0;
  let skipped = [];
  let failed = [];

  for (const filename of files) {
    try {
      const ok = await annotateScreenshot(page, filename, annotations[filename]);
      if (ok) {
        done++;
        if (done % 10 === 0) console.log(`Progress: ${done}/${files.length}`);
      } else {
        skipped.push(filename);
      }
    } catch (err) {
      console.error(`FAILED: ${filename} — ${err.message}`);
      failed.push(filename);
    }
  }

  await browser.close();

  console.log(`\nDone: ${done} annotated, ${skipped.length} skipped (missing), ${failed.length} failed`);
  if (skipped.length) console.log('Skipped:', skipped);
  if (failed.length) console.log('Failed:', failed);
})();
