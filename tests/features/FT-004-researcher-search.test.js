// FT-004: Researcher Search & Filter
module.exports = {
  id: 'FT-004',
  title: 'Researcher Search & Filter',
  testMode: 'browser',
  userStory: 'US-2.1',
  acceptance: [
    'AC-1: GIVEN the researcher list loads, WHEN the user types in search, THEN the table filters in real-time',
    'AC-2: GIVEN the list is displayed, WHEN a lab is selected, THEN only researchers from that lab are shown',
    'AC-3: GIVEN the list is displayed, WHEN a theme is selected, THEN only researchers with that theme are shown',
    'AC-4: GIVEN both filters are active, WHEN combined, THEN AND logic applies'
  ]
};
