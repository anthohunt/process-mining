// FT-006: Side-by-Side Comparison
module.exports = {
  id: 'FT-006',
  title: 'Side-by-Side Comparison',
  testMode: 'browser',
  userStory: 'US-2.4',
  acceptance: [
    'AC-1: GIVEN the comparison screen loads, WHEN two researchers are selected, THEN profiles display in two columns with similarity gauge',
    'AC-2: GIVEN the comparison displays, WHEN common themes exist, THEN they are highlighted with blue outline',
    'AC-3: GIVEN the comparison displays, WHEN similarity is computed, THEN gauge shows percentage in circular display',
    'AC-4: GIVEN the comparison displays, WHEN common themes exist, THEN a summary card lists shared themes'
  ]
};
