// FT-013: User Login
module.exports = {
  id: 'FT-013',
  title: 'User Login',
  testMode: 'browser',
  userStory: 'US-5.1',
  acceptance: [
    'AC-1: GIVEN login screen is displayed, WHEN valid credentials submitted, THEN user is authenticated and redirected to dashboard',
    'AC-2: GIVEN user is logged in, WHEN navbar renders, THEN "Connexion" button replaced by avatar and name with dropdown',
    'AC-3: GIVEN user is logged in as admin, WHEN navbar renders, THEN "Admin" tab appears with admin badge',
    'AC-4: GIVEN user dropdown is visible, WHEN "Mon profil" clicked, THEN navigates to own profile',
    'AC-5: GIVEN user dropdown is visible, WHEN "Deconnexion" clicked, THEN logged out and navbar reverts'
  ]
};
