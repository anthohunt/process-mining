// FT-025: ARIA Labels
module.exports = {
  id: 'FT-025',
  title: 'ARIA Labels',
  testMode: 'browser',
  userStory: 'US-A11Y-004',
  acceptance: [
    'AC-1: GIVEN any interactive element, WHEN read by screen reader, THEN it has a descriptive aria-label or visible label',
    'AC-2: GIVEN stat cards displayed, WHEN read by screen reader, THEN each card is read as "N Chercheurs" etc.',
    'AC-3: GIVEN similarity gauge displays, WHEN read by screen reader, THEN it announces "Score de similarite: 72%"',
    'AC-4: GIVEN SVG map displayed, WHEN read by screen reader, THEN it has descriptive aria-label and dot labels'
  ]
};
