// FT-017: Admin User Management
module.exports = {
  id: 'FT-017',
  title: 'Admin User Management',
  testMode: 'browser',
  userStory: 'US-4.1',
  acceptance: [
    'AC-1: GIVEN admin navigates to admin panel, WHEN Users tab loads, THEN table displays all users with roles and statuses',
    'AC-2: GIVEN user table displayed, WHEN admin clicks "Modifier", THEN role can be changed',
    'AC-3: GIVEN admin clicks "Inviter un utilisateur", WHEN dialog opens, THEN email invitation can be sent',
    'AC-4: GIVEN pending profiles exist, WHEN "Profils en attente" tab opened, THEN Approve/Reject buttons shown',
    'AC-5: GIVEN a pending profile, WHEN admin clicks "Approuver", THEN profile becomes published',
    'AC-6: GIVEN a pending profile, WHEN admin clicks "Rejeter", THEN profile is rejected'
  ]
};
