// FT-021: Admin Pending Profiles
module.exports = {
  id: 'FT-021',
  title: 'Admin Pending Profiles',
  testMode: 'browser',
  userStory: 'US-4.1',
  acceptance: [
    'AC-1: GIVEN pending profiles exist, WHEN "Profils en attente" tab opened, THEN table shows name, lab, themes, date, actions',
    'AC-2: GIVEN a pending profile, WHEN admin clicks "Approuver", THEN profile approved and removed from list',
    'AC-3: GIVEN a pending profile, WHEN admin clicks "Rejeter", THEN profile rejected and removed from list'
  ]
};
