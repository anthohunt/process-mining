// FT-003: Mini-Map Preview
module.exports = {
  id: 'FT-003',
  title: 'Mini-Map Preview',
  testMode: 'browser',
  userStory: 'US-1.3',
  acceptance: [
    'AC-1: GIVEN the dashboard loads, WHEN cluster data is available, THEN a simplified SVG preview renders in the mini-map area',
    'AC-2: GIVEN the mini-map is displayed, WHEN hovered, THEN pointer cursor and blue outline appear',
    'AC-3: GIVEN the mini-map is displayed, WHEN clicked, THEN navigates to the full map view'
  ]
};
