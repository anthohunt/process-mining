// FT-005: Researcher Profile View — Playwright E2E
module.exports = async function(page) {
  const results = [];
  const BASE = 'http://localhost:5173';

  // AC-1: Profile sidebar displays avatar, name, lab, bio
  let start = Date.now();
  await page.goto(`${BASE}/researchers`);
  await page.locator('.app-table tbody tr, [data-testid="researcher-row"]').first().click();
  await page.waitForURL(/\/researchers\//);
  const name = await page.locator('[data-testid="profile-name"], .profile-name').textContent();
  const lab = await page.locator('[data-testid="profile-lab"], .profile-lab').textContent();
  results.push({
    id: 'AC-1',
    criterion: 'Profile sidebar displays avatar, name, lab, bio',
    status: name && lab ? 'pass' : 'fail',
    detail: `Name: "${name}", Lab: "${lab}"`,
    duration: Date.now() - start
  });

  // AC-2: Keywords display as colored tags
  start = Date.now();
  const tags = await page.locator('[data-testid="keyword-tag"], .tag').count();
  results.push({
    id: 'AC-2',
    criterion: 'Keywords display as colored tags',
    status: tags > 0 ? 'pass' : 'fail',
    detail: `Tag count: ${tags}`,
    duration: Date.now() - start
  });

  // AC-3: Publications list with title, co-authors, venue
  start = Date.now();
  const pubs = await page.locator('[data-testid="publication-item"], [data-testid="profile-publications"] > div > div').count();
  results.push({
    id: 'AC-3',
    criterion: 'Publications display with title, co-authors, venue',
    status: pubs > 0 ? 'pass' : 'fail',
    detail: `Publication items: ${pubs}`,
    duration: Date.now() - start
  });

  // AC-4: "Voir sur la carte" button navigates to map
  start = Date.now();
  await page.locator('text=/voir sur la carte/i, [data-testid="profile-map-link"]').click();
  await page.waitForURL(/\/map/);
  results.push({
    id: 'AC-4',
    criterion: '"Voir sur la carte" navigates to map',
    status: page.url().includes('/map') ? 'pass' : 'fail',
    detail: `URL: ${page.url()}`,
    duration: Date.now() - start
  });

  // Edge E1: No publications
  start = Date.now();
  await page.route('**/api/researchers/**', route => route.fulfill({
    status: 200, contentType: 'application/json',
    body: JSON.stringify({ id: '1', full_name: 'Test', lab: 'LORIA', bio: 'Bio', keywords: ['NLP'], publications: [], map_x: 100, map_y: 100, cluster_id: null })
  }));
  await page.goto(`${BASE}/researchers/1`);
  const noPubMsg = await page.locator('text=/aucune publication/i').count();
  results.push({
    id: 'E1',
    criterion: 'No publications shows empty state message',
    status: noPubMsg > 0 ? 'pass' : 'fail',
    detail: `Empty pub message: ${noPubMsg}`,
    duration: Date.now() - start
  });
  await page.unroute('**/api/researchers/**');

  // Edge E2: Profile 404
  start = Date.now();
  await page.route('**/api/researchers/**', route => route.fulfill({ status: 404 }));
  await page.goto(`${BASE}/researchers/nonexistent`);
  const notFoundMsg = await page.locator('text=/profil introuvable/i').count();
  results.push({
    id: 'E2',
    criterion: 'Profile 404 shows "Profil introuvable"',
    status: notFoundMsg > 0 ? 'pass' : 'fail',
    detail: `Not found message: ${notFoundMsg}`,
    duration: Date.now() - start
  });
  await page.unroute('**/api/researchers/**');

  // Edge E3: Very long bio truncation
  start = Date.now();
  const longBio = 'A'.repeat(3000);
  await page.route('**/api/researchers/**', route => route.fulfill({
    status: 200, contentType: 'application/json',
    body: JSON.stringify({ id: '1', full_name: 'Long Bio', lab: 'LORIA', bio: longBio, keywords: [], publications: [], map_x: 100, map_y: 100, cluster_id: null })
  }));
  await page.goto(`${BASE}/researchers/1`);
  const readMore = await page.locator('text=/lire la suite/i').count();
  results.push({
    id: 'E3',
    criterion: 'Long bio is truncated with "Lire la suite"',
    status: readMore > 0 ? 'pass' : 'fail',
    detail: `Read more link: ${readMore}`,
    duration: Date.now() - start
  });

  return results;
};
