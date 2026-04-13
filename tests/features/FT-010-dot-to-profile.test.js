// FT-010: Researcher Dot to Profile
module.exports = {
  id: 'FT-010',
  title: 'Researcher Dot to Profile',
  testMode: 'browser',
  userStory: 'US-3.3',
  acceptance: [
    'AC-1: GIVEN the map is displayed, WHEN user hovers a dot, THEN researcher name appears as tooltip',
    'AC-2: GIVEN the map is displayed, WHEN user clicks a dot, THEN navigates to that researcher profile',
    'AC-3: GIVEN dots are displayed, WHEN hovered, THEN cursor changes to pointer'
  ]
};
