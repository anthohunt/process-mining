// FT-001: Dashboard Stats Display
module.exports = {
  id: 'FT-001',
  title: 'Dashboard Stats Display',
  testMode: 'browser',
  userStory: 'US-1.1',
  acceptance: [
    'AC-1: GIVEN the dashboard loads, WHEN the API returns stats, THEN 4 cards display with current counts',
    'AC-2: GIVEN the dashboard is visible, WHEN data changes, THEN stat numbers update without full page reload',
    'AC-3: GIVEN a stat card is displayed, WHEN the user clicks it, THEN they navigate to the corresponding section'
  ]
};
