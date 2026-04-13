// FT-023: Focus Management
module.exports = {
  id: 'FT-023',
  title: 'Focus Management',
  testMode: 'browser',
  userStory: 'US-A11Y-002',
  acceptance: [
    'AC-1: GIVEN screen navigation occurs, WHEN new screen renders, THEN focus moves to first heading or main content',
    'AC-2: GIVEN a modal/popover opens, WHEN rendered, THEN focus is trapped inside',
    'AC-3: GIVEN a modal/popover closes, WHEN dismissed, THEN focus returns to triggering element'
  ]
};
