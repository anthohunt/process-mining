// FT-015: Profile Form Add/Edit
module.exports = {
  id: 'FT-015',
  title: 'Profile Form Add/Edit',
  testMode: 'browser',
  userStory: 'US-2.3',
  acceptance: [
    'AC-1: GIVEN logged-in researcher navigates to form, WHEN loads, THEN fields pre-populated (edit) or empty (add)',
    'AC-2: GIVEN the form is displayed, WHEN user types keyword and presses Enter, THEN new tag is added',
    'AC-3: GIVEN the form is displayed, WHEN user clicks "+ Ajouter une publication", THEN new blank publication block appears',
    'AC-4: GIVEN user fills the form, WHEN they click "Enregistrer", THEN profile submitted for admin approval',
    'AC-5: GIVEN the form is displayed, WHEN user clicks "Annuler", THEN returns to researcher list',
    'AC-6: GIVEN the form loads, WHEN displayed, THEN yellow approval banner is shown'
  ]
};
