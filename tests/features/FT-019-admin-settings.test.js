// FT-019: Admin App Settings
module.exports = {
  id: 'FT-019',
  title: 'Admin App Settings',
  testMode: 'browser',
  userStory: 'US-4.3',
  acceptance: [
    'AC-1: GIVEN settings tab loads, THEN current language, threshold, and NLP algorithm are pre-populated',
    'AC-2: GIVEN language section displayed, WHEN admin selects EN, THEN radio updates (not applied until Save)',
    'AC-3: GIVEN similarity slider displayed, WHEN dragged, THEN numeric value updates in real-time',
    'AC-4: GIVEN admin clicks "Sauvegarder", WHEN API succeeds, THEN success toast appears'
  ]
};
