// FT-005: Researcher Profile View
module.exports = {
  id: 'FT-005',
  title: 'Researcher Profile View',
  testMode: 'browser',
  userStory: 'US-2.2',
  acceptance: [
    'AC-1: GIVEN a researcher is selected, WHEN profile loads, THEN sidebar displays avatar, name, lab, bio',
    'AC-2: GIVEN the profile loads, WHEN keywords exist, THEN they display as colored tags',
    'AC-3: GIVEN the profile loads, WHEN publications exist, THEN they display with title, co-authors, venue/year',
    'AC-4: GIVEN profile has map data, WHEN user clicks "Voir sur la carte", THEN navigates to map centered on researcher'
  ]
};
