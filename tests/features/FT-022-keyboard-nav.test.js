// FT-022: Keyboard Navigation
module.exports = {
  id: 'FT-022',
  title: 'Keyboard Navigation',
  testMode: 'browser',
  userStory: 'US-A11Y-001',
  acceptance: [
    'AC-1: GIVEN any screen, WHEN user presses Tab, THEN focus moves to next interactive element in DOM order',
    'AC-2: GIVEN any screen, WHEN user presses Shift+Tab, THEN focus moves to previous interactive element',
    'AC-3: GIVEN a focused button/link, WHEN user presses Enter or Space, THEN element is activated'
  ]
};
