// FT-024: Escape Key Dismissal
module.exports = {
  id: 'FT-024',
  title: 'Escape Key Dismissal',
  testMode: 'browser',
  userStory: 'US-A11Y-003',
  acceptance: [
    'AC-1: GIVEN user dropdown is open, WHEN Escape pressed, THEN it closes and focus returns to user area',
    'AC-2: GIVEN a cluster popover is open on the map, WHEN Escape pressed, THEN it closes',
    'AC-3: GIVEN a confirmation dialog is open, WHEN Escape pressed, THEN it is dismissed (equivalent to Cancel)'
  ]
};
