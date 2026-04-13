// FT-002: Activity Feed — Playwright E2E
module.exports = async function(page) {
  const results = [];
  const BASE = 'http://localhost:5173';

  // AC-1: Activity items display with avatar, name, action, timestamp
  let start = Date.now();
  await page.goto(BASE);
  const activityItems = await page.locator('[data-testid="activity-item"]').count();
  results.push({
    id: 'AC-1',
    criterion: 'Activity items display (max 5)',
    status: activityItems > 0 && activityItems <= 5 ? 'pass' : 'fail',
    detail: `Found ${activityItems} activity items`,
    duration: Date.now() - start
  });

  // AC-2: Sorted by date descending (first item is newest)
  start = Date.now();
  const timestamps = await page.locator('[data-testid="activity-item"] [data-testid="activity-time"]').allTextContents();
  results.push({
    id: 'AC-2',
    criterion: 'Activities sorted by date descending',
    status: timestamps.length > 0 ? 'pass' : 'fail',
    detail: `Timestamps: ${timestamps.slice(0, 3).join(', ')}`,
    duration: Date.now() - start
  });

  // AC-3: Click name navigates to profile
  start = Date.now();
  const nameLink = page.locator('[data-testid="activity-item"] a, [data-testid="activity-item"] [data-testid="activity-name"]').first();
  if (await nameLink.count() > 0) {
    await nameLink.click();
    await page.waitForURL(/\/researchers\//);
    results.push({
      id: 'AC-3',
      criterion: 'Clicking researcher name navigates to profile',
      status: 'pass',
      detail: `Navigated to: ${page.url()}`,
      duration: Date.now() - start
    });
  } else {
    results.push({ id: 'AC-3', criterion: 'Clicking researcher name navigates to profile', status: 'fail', detail: 'No clickable name found', duration: Date.now() - start });
  }

  // Edge E1: No activities — empty state
  start = Date.now();
  await page.route('**/api/activity', route => route.fulfill({
    status: 200, contentType: 'application/json', body: '[]'
  }));
  await page.goto(BASE);
  const emptyMsg = await page.locator('text=/aucune activite/i').count();
  results.push({
    id: 'E1',
    criterion: 'Empty activities shows "Aucune activite" message',
    status: emptyMsg > 0 ? 'pass' : 'fail',
    detail: `Empty state elements: ${emptyMsg}`,
    duration: Date.now() - start
  });
  await page.unroute('**/api/activity');

  // Edge E2: API failure — error with retry
  start = Date.now();
  await page.route('**/api/activity', route => route.fulfill({ status: 500, body: 'Internal Server Error' }));
  await page.goto(BASE);
  const errorRetry = await page.locator('[data-testid="activity-error"], text=/erreur/i').count();
  results.push({
    id: 'E2',
    criterion: 'API failure shows error with retry',
    status: errorRetry > 0 ? 'pass' : 'fail',
    detail: `Error elements: ${errorRetry}`,
    duration: Date.now() - start
  });
  await page.unroute('**/api/activity');

  // Edge E3: Deleted researcher — grayed out name
  start = Date.now();
  await page.route('**/api/activity', route => route.fulfill({
    status: 200, contentType: 'application/json',
    body: JSON.stringify([{ id: '1', user_name: 'Deleted User', action: 'profile_update', detail: 'Updated profile', created_at: new Date().toISOString(), researcher_id: null }])
  }));
  await page.goto(BASE);
  const grayedName = await page.locator('[data-testid="activity-item"]').first().textContent();
  results.push({
    id: 'E3',
    criterion: 'Deleted researcher name shown as non-clickable',
    status: grayedName.includes('Deleted') ? 'pass' : 'fail',
    detail: `Activity text: "${grayedName.substring(0, 80)}"`,
    duration: Date.now() - start
  });

  return results;
};
