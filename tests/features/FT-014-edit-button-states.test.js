// FT-014: Profile Edit Button States
module.exports = {
  id: 'FT-014',
  title: 'Profile Edit Button States',
  testMode: 'browser',
  userStory: 'US-5.2',
  acceptance: [
    'AC-1: GIVEN logged-in researcher views own profile, WHEN "Modifier" displayed, THEN it is enabled and clickable',
    'AC-2: GIVEN logged-in researcher views another profile, WHEN "Modifier" displayed, THEN disabled with lock icon',
    'AC-3: GIVEN user is not logged in, WHEN viewing profile, THEN "Modifier" button is hidden',
    'AC-4: GIVEN researcher submits profile, WHEN submission succeeds, THEN it appears in admin pending list'
  ]
};
