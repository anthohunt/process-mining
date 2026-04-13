// FT-020: Admin Audit Logs
module.exports = {
  id: 'FT-020',
  title: 'Admin Audit Logs',
  testMode: 'browser',
  userStory: 'US-4.4',
  acceptance: [
    'AC-1: GIVEN logs tab loads, WHEN log data available, THEN table displays date, user, action tag, detail',
    'AC-2: GIVEN date filters displayed, WHEN range set and "Filtrer" clicked, THEN only matching logs shown',
    'AC-3: GIVEN log entries exist, THEN actions are color-coded: Ajout=green, Modification=blue, Suppression=red, Import=orange'
  ]
};
