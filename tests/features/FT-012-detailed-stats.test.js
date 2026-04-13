// FT-012: Detailed Statistics
module.exports = {
  id: 'FT-012',
  title: 'Detailed Statistics',
  testMode: 'browser',
  userStory: 'US-1.4',
  acceptance: [
    'AC-1: GIVEN the stats screen loads, WHEN theme data is available, THEN bar chart displays theme distribution',
    'AC-2: GIVEN the stats screen loads, WHEN temporal data is available, THEN line chart displays trends',
    'AC-3: GIVEN the stats screen loads, WHEN similarity data is available, THEN histogram displays score distribution',
    'AC-4: GIVEN any chart is displayed, WHEN user hovers a data point, THEN tooltip shows exact value'
  ]
};
