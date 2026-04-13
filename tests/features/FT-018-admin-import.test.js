// FT-018: Admin Bulk Import
module.exports = {
  id: 'FT-018',
  title: 'Admin Bulk Import',
  testMode: 'browser',
  userStory: 'US-4.2',
  acceptance: [
    'AC-1: GIVEN import tab displayed, WHEN admin drags CSV, THEN file is parsed and preview table populated',
    'AC-2: GIVEN import tab displayed, WHEN admin pastes Scholar URL and clicks "Importer", THEN data fetched and shown in preview',
    'AC-3: GIVEN preview shows data, WHEN admin clicks "Importer N chercheurs", THEN records are created',
    'AC-4: GIVEN import succeeds, WHEN admin clicks "Voir les logs", THEN navigates to audit log tab'
  ]
};
